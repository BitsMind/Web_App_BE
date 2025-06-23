import { redis, storeRefreshTokenRD } from "../../../backend/lib/redis/redis.js";
import User from "../../User/models/user.models.js";
import { generateTokens } from "../../utils/generateToken.js";
import { generateVerificationToken } from "../../utils/generateVerificationCode.js";
import { comparePassword, hashPassword } from "../../utils/hashPass.js";
import Account from "../models/account.models.js";
import { accountDTO, logoutDTO, tokenDTO, userDTO } from "../dto/auth.dto.js";
import dotenv from "dotenv";
import  jwt  from "jsonwebtoken";
import { validateEmail } from "../../utils/Validation/validateEmail.js";
import { validatePassword } from "../../utils/Validation/validatePassword.js";
import UserActivity from "../../User/models/UserActivities.js";
import mongoose from "mongoose";
import AudioFile from "../../AudioFile/model/audioFile.model.js";

dotenv.config();

//Constant
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
const VERIFICATION_EMAIL_EXPIRY = 10 * 60 * 1000; // 10 minutes

/**
 * User registration service
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {object} res - Express response object
 * @returns {object} User, account and token data
 */
export const signupService = async(name, email, password, res, req) => {
    try {
        if (!name || !email || !password) { throw { status: 400, message: "All fields are required!" };}


        if (!validateEmail(email)) { throw { status: 400, message: "Invalid email format!" };}
        const existingEmail = await Account.findOne({ email });
        if (existingEmail) { throw { status: 400, message: "Email is already taken!!" };}
    
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) { throw { status: 400, message: passwordValidation.message };}
    
        const hashedPassword = await hashPassword(password);
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);
    
        const newAccount = new Account({ email, password: hashedPassword, verificationToken, verificationTokenExpireAt: verificationTokenExpiry, userType: "USER" });
        const newUser = new User({ name, email, accountId: newAccount._id });

        await Promise.all([
            newAccount.save(),
            newUser.save(),
            // sendVerificationEmail(email, newUser.name ,verificationToken),
        ])
        const { accessToken, refreshToken } = await generateTokens(newAccount._id, email, req, res);
        await storeRefreshTokenRD(newAccount._id, refreshToken);

        //Add activity logging
        await logUserActivity(newAccount._id, 'SIGNUP', { ip: req ? req.ip : 'unknown' });
    
        return { user: userDTO(newUser), account: accountDTO(newAccount), token: tokenDTO(accessToken, refreshToken) };
    } catch (error) {
        console.error("Error in signupService: ", error.message);
        throw error;
    }
}

// /**
//  * User login service with rate limiting
//  * @param {string} email - User's email
//  * @param {string} password - User's password
//  * @param {object} res - Express response object
//  * @returns {object} User, account and token data
//  */
export const loginService = async (email, password, res, req) => {
    try {
        if (!email || !password) {throw { status: 400, message: "Email and password are required" }};

        // Check for rate limiting(prevent brute-force attacks)
        const ipAddress = req ? req.ip : "unknown";
        const ipKey = `login_attempts:${ipAddress}`;
        const attempts = parseInt(await redis.get(ipKey) || 0);

        if  (attempts >= MAX_LOGIN_ATTEMPTS) {throw { status: 429, message: "Too many login attempts. Please try again later." }};

        const account = await Account.findOne({ email });
        if (!account) { await redis.incr(ipKey);await redis.expire(ipKey, LOGIN_LOCKOUT_DURATION);throw { status: 400, message: "Invalid email or password!" }}
        if (!account.isVerified) { throw { status: 403, message: "Your account is not verified. Please check your email." };}

        const isPasswordCorrect = await comparePassword(password, account.password);
        if (!isPasswordCorrect) { await redis.incr(ipKey);await redis.expire(ipKey, LOGIN_LOCKOUT_DURATION); throw { status: 400, message: "Invalid email or password!" };}

        // Reset failed attempts on successful login
        await redis.del(ipKey);

        const { accessToken, refreshToken } = await generateTokens(account._id, account.email, req, res);
        await storeRefreshTokenRD(account._id, refreshToken);

        const user = await User.findOne({ accountId: account._id });
        if (!user) { throw { status: 404, message: "User not found!" }; }

        await Account.updateOne({ _id: account._id }, { $set: { lastLogin: new Date() }});
        await logUserActivity(account._id, "LOGIN", {ip: req ? req.ip : "unknown"})

        return {user: userDTO(user), account: accountDTO(account), tokens: tokenDTO(accessToken, refreshToken)};
    } catch (error) {
        console.error("Error in loginService:", error.message);
        throw error; 
    }
}

// /**
//  * Handle user logout by invalidating refresh token
//  * @param {string} refreshToken - JWT refresh token
//  * @returns {object} Logout operation result
//  */
export const logoutService = async(refreshToken, res) => {
    try {
        if (!refreshToken) {throw { status: 400, message: "No refresh token provided!" }}
        // Clear cookies regardless of token validity
        clearAuthCookies(res);
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // Check if token actually exists before trying to delete
            const tokenExists = await redis.exists(`refresh_token:${decoded.accountId}`);

            if (tokenExists) {
                await redis.del(`refresh_token:${decoded.accountId}`);
                await logUserActivity(decoded.accountId, 'LOGOUT', { tokenId: decoded.jti });
            }
        } catch (error) {
            console.warn("Invalid or expired refresh token:", error.message);
        }
        return logoutDTO("Logout successful!");
    } catch (error) {
        console.error("Error in logoutService: ", error.message);
        throw error;                
    }
}

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {object} User data with account information
 */
export const getMeService = async(userId, res) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {throw { status: 401, message: "Unauthorized access" }}
        const user = await User.findById(userId).select("-password -email").populate("accountId", "-password -resetPasswordToken -resetPasswordExpireAt -verificationToken").lean();
        if (!user) {throw { status: 404, message: "User not found!" }}
        if (!user.accountId) {throw { status: 404, message: "Account not found" }}

        await logUserActivity(userId, 'ME_ENDPOINT_ACCESSED');
        return {user: userDTO(user), account: accountDTO(user.accountId)}
    } catch (error) {
        console.error("Error in getMeService:", error.message);
        throw error;                
    }
}

/**
 * Get user profile with audio watermarked information
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} userId - User ID
 * @returns {object} User profile data
 */
export const getUserProfileService = async (userId, page, limit, all = false) => {
    try {
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 8;

        if (pageNumber < 1 || limitNumber < 1) {
            throw { status: 400, message: "Invalid pagination parameters" };
        }
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw { status: 400, message: "Valid user ID is required" };
        }

        const skip = (pageNumber - 1) * limitNumber;

        // Get total count for pagination
        const totalAudioFiles = await AudioFile.countDocuments({ uploadedBy: userId });

        if (totalAudioFiles === 0) {
            return {
                audioFiles: [],
                totalPages: 0,
                currentPage: pageNumber,
                totalAudioFiles: 0,
                userStats: null
            };
        }

        // Get user information with stats
        const user = await User.findById(userId)
            .select("name email totalProcessedFiles totalPaid")
            .lean();

        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        let audioFileQuery = AudioFile.find({ uploadedBy: userId }).sort({ createdAt: -1 });

        if (!all) {
            audioFileQuery = audioFileQuery.skip(skip).limit(limitNumber);
        }

        const audioFiles = await audioFileQuery.lean();

        // Format audio files with proper null checks
        const formattedAudioFiles = audioFiles.map((file) => ({
            id: file?._id,
            fileName: file?.fileName,
            filePath: file?.filePath,
            fileSize: file?.fileSize || 0,
            format: file?.format,
            isWatermarked: file?.isWatermarked || false,
            watermarkMessage: file?.watermarkMessage || null,
            processingStatus: file?.processingStatus || "pending",
            processedAt: file?.processedAt,
            createdAt: file?.createdAt,
            updatedAt: file?.updatedAt
        }));

        return {
            audioFiles: formattedAudioFiles,
            totalPages: all ? 1 : Math.ceil(totalAudioFiles / limitNumber),
            currentPage: all ? 1 : pageNumber,
            totalAudioFiles,
            userStats: {
                name: user.name,
                email: user.email,
                totalProcessedFiles: user.totalProcessedFiles || 0,
                totalPaid: user.totalPaid || 0
            }
        };
    } catch (error) {
        console.error("Error in getUserProfileService:", error.message);
        throw error;
    }
};

// /**
//  * Log user activity to the database
//  * @param {string} accountId - User's account ID
//  * @param {string} activity - Activity type (e.g., SIGNUP, LOGIN)
//  * @param {object} metadata - Additional details like IP, device info
//  */
const logUserActivity = async (accountId, activity, metadata = {}) => {
    try {
      await UserActivity.create({
        accountId,
        activity,
        metadata
      });
  
      console.log(`Activity '${activity}' logged for user ${accountId}`);
    } catch (error) {
      console.error("Error logging user activity:", error.message);
      // Still don't throw – logging shouldn't block critical flow
    }
  };


// /**
//  * Helper function to clear authentication cookies
//  * @param {object} res - Express response object
//  */
const clearAuthCookies = (res) => {
    // Get the same domain used when setting cookies
    const domain = ".url";
    
    // Clear accessToken cookie
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'Lax',
        // domain: domain,
        path: '/api', // Match the path used when setting
        secure: process.env.NODE_ENV === 'production'
    });
    
    // Clear refreshToken cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'Lax',
        // domain: domain,
        path: '/api/auth', // Match the path used when setting
        secure: process.env.NODE_ENV === 'production'
    });
    
    console.log("Auth cookies cleared successfully");
};
