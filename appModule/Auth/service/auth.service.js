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
import { avatarCloudinary } from "../../../backend/lib/cloudinary/cloudinary.js";


dotenv.config();
const cloudinary = avatarCloudinary();
//Constant
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
const VERIFICATION_EMAIL_EXPIRY = 10 * 60 * 1000; // 10 minutes

const SAMESITE = process.env.COOKIE_SAME_SITE || "Lax"; 
const DOMAIN = process.env.COOKIE_DOMAIN || ".jennyfairy.store";
const SECURE = process.env.NODE_ENV === "production";

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
 * Get user profile with audio watermarked information and enhanced user data
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} all - Whether to return all files or paginated
 * @returns {object} User profile data with audio files and enhanced stats
 */
export const getUserProfileService = async (userId) => {
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw { status: 400, message: "Valid user ID is required" };
        }

        // Get total count for stats
        const totalAudioFiles = await AudioFile.countDocuments({ uploadedBy: userId });

        // Get user information with enhanced stats and account details
        const user = await User.findById(userId)
            .select("name email avatar usedStorage totalProcessedFiles totalPaid createdAt")
            .populate({
                path: "accountId",
                select: "email isVerified userType lastLogin createdAt"
            })
            .lean();

        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        if (totalAudioFiles === 0) {
            // Enhanced user stats with additional calculations
            const userStats = {
                // Basic info
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                memberSince: user.createdAt,
                
                // Account info
                isVerified: user.accountId?.isVerified || false,
                userType: user.accountId?.userType || "USER",
                lastLogin: user.accountId?.lastLogin || null,
                
                // File and storage stats
                totalProcessedFiles: user.totalProcessedFiles || 0,
                totalPaid: user.totalPaid || 0,
                usedStorage: user.usedStorage || 0,
                totalAudioFiles: totalAudioFiles,
                totalDetectionCount: 0, // No files, so no detections
                
                // Storage formatting for better UX
                usedStorageFormatted: formatBytes(user.usedStorage || 0),
                
                // Additional calculated stats
                averageFileSize: 0,
                averageFileSizeFormatted: "0 B"
            };

            return {
                audioFiles: [],
                totalAudioFiles: 0,
                userStats: userStats
            };
        }

        // Get all audio files for the user (no pagination) with proper populate
        const audioFiles = await AudioFile.find({ uploadedBy: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "watermarkedMessageId", // Changed from "watermarkedMessage" to match schema
                select: "message detectionCount lastDetectedAt binaryId", // Include binaryId if using Option 1
                model: "WatermarkedMessage"
            })
            .lean();

        // Calculate total detection count across all files
        const totalDetectionCount = audioFiles.reduce((total, file) => {
            return total + (file?.watermarkedMessageId?.detectionCount || 0);
        }, 0);

        // Enhanced user stats with additional calculations
        const userStats = {
            // Basic info
            name: user.name,
            email: user.email,
            avatar: user.avatar || null,
            memberSince: user.createdAt,
            
            // Account info
            isVerified: user.accountId?.isVerified || false,
            userType: user.accountId?.userType || "USER",
            lastLogin: user.accountId?.lastLogin || null,
            
            // File and storage stats
            totalProcessedFiles: user.totalProcessedFiles || 0,
            totalPaid: user.totalPaid || 0,
            usedStorage: user.usedStorage || 0,
            totalAudioFiles: totalAudioFiles,
            totalDetectionCount: totalDetectionCount, // New field for total detections
            
            // Storage formatting for better UX
            usedStorageFormatted: formatBytes(user.usedStorage || 0),
            
            // Additional calculated stats
            averageFileSize: totalAudioFiles > 0 ? Math.round((user.usedStorage || 0) / totalAudioFiles) : 0,
            averageFileSizeFormatted: totalAudioFiles > 0 ? formatBytes(Math.round((user.usedStorage || 0) / totalAudioFiles)) : "0 B"
        };

        // Enhanced audio file formatting with corrected field access
        const formattedAudioFiles = audioFiles.map((file) => ({
            id: file?._id,
            fileName: file?.fileName,
            filePath: file?.filePath,
            fileSize: file?.fileSize || 0,
            fileSizeFormatted: formatBytes(file?.fileSize || 0),
            format: file?.format,
            
            // Fixed: access duration from metadata if it exists there
            duration: file?.metadata?.duration || file?.duration || null,
            
            // Watermark info - Fixed field access
            isWatermarked: file?.isWatermarked || false,
            
            // Fixed: access the populated watermarkedMessageId object
            watermarkMessage: file?.watermarkedMessageId?.message || file?.watermarkMessage || null,
            watermarkBinaryId: file?.watermarkedMessageId?.binaryId || file?.watermarkMessage || null, // Binary ID if using Option 1
            watermarkDetectionCount: file?.watermarkedMessageId?.detectionCount || 0,
            lastDetectedAt: file?.watermarkedMessageId?.lastDetectedAt || file?.detectionTimestamp || null,
            
            // Detection info from schema
            watermarkDetected: file?.watermarkDetected,
            confidence: file?.confidence,
            detectedMessage: file?.detectedMessage,
            
            // Processing info
            processingStatus: file?.processingStatus || "pending",
            processedAt: file?.processedAt,
            
            // Additional metadata
            metadata: {
                bitrate: file?.metadata?.bitrate,
                sampleRate: file?.metadata?.sampleRate,
                channels: file?.metadata?.channels
            },
            
            // Category and tags
            category: file?.category,
            tags: file?.tags || [],
            
            // Privacy
            isPublic: file?.isPublic || false,
            
            // Timestamps
            createdAt: file?.createdAt,
            updatedAt: file?.updatedAt,
            
            // Time ago for better UX
            uploadedAgo: getTimeAgo(file?.createdAt)
        }));

        // Statistics for all files
        const fileStats = {
            totalFiles: formattedAudioFiles.length,
            totalSize: formattedAudioFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0),
            totalSizeFormatted: formatBytes(
                formattedAudioFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0)
            ),
            watermarkedFilesCount: formattedAudioFiles.filter(file => file.isWatermarked).length,
            detectedWatermarkCount: formattedAudioFiles.filter(file => file.watermarkDetected === true).length,
            totalDetectionCount: totalDetectionCount, // Add total detection count to file stats too
            averageDetectionsPerFile: totalAudioFiles > 0 ? (totalDetectionCount / totalAudioFiles).toFixed(2) : 0,
            processingStatusCounts: getProcessingStatusCounts(formattedAudioFiles),
            categoryCounts: formattedAudioFiles.reduce((counts, file) => {
                const category = file.category || 'other';
                counts[category] = (counts[category] || 0) + 1;
                return counts;
            }, {}),
            formatCounts: formattedAudioFiles.reduce((counts, file) => {
                const format = file.format || 'unknown';
                counts[format] = (counts[format] || 0) + 1;
                return counts;
            }, {})
        };

        return {
            audioFiles: formattedAudioFiles,
            totalAudioFiles,
            userStats: userStats,
            fileStats: fileStats
        };

    } catch (error) {
        console.error("Error in getUserProfileService:", error.message);
        
        // Return more specific error information
        if (error.status) {
            throw error;
        }
        
        // Handle database errors
        if (error.name === 'CastError') {
            throw { status: 400, message: "Invalid ID format" };
        }
        
        if (error.name === 'ValidationError') {
            throw { status: 400, message: error.message };
        }
        
        // Generic server error
        throw { status: 500, message: "Internal server error" };
    }
};


/**
 * Update user profile information (name and avatar)
 * @param {string} userId - User ID
 * @param {object} updateData - Data to update { name, avatar }
 * @param {object} req - Express request object for logging
 * @returns {object} Updated user and account data
 */
export const updateUserService = async (userId, updateData, req) => {
    try {
        // Validate user ID
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            throw { status: 400, message: "Valid user ID is required!" };
        }

        // Check if updateData is provided
        if (!updateData || Object.keys(updateData).length === 0) {
            throw { status: 400, message: "Update data is required!" };
        }

        const { name, avatar } = updateData;

        // Validate that at least one field is being updated
        if (!name && !avatar) {
            throw { status: 400, message: "At least one field (name or avatar) must be provided!" };
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found!" };
        }

        // Find the associated account
        const account = await Account.findById(user.accountId);
        if (!account) {
            throw { status: 404, message: "Associated account not found!" };
        }

        const updates = {};
        let uploadedAvatarUrl = null;

        // Handle name update
        if (name) {
            // Validate name
            if (typeof name !== 'string' || name.trim().length === 0) {
                throw { status: 400, message: "Name must be a non-empty string!" };
            }

            if (name.trim().length < 2) {
                throw { status: 400, message: "Name must be at least 2 characters long!" };
            }

            if (name.trim().length > 50) {
                throw { status: 400, message: "Name must be less than 50 characters!" };
            }

            updates.name = name.trim();
        }

        // Handle avatar update
        if (avatar) {
            try {
                // Check if avatar is a new upload (base64) or existing URL
                if (typeof avatar === 'string' && !avatar.startsWith("https://res.cloudinary.com/")) {
                    // Upload new avatar to Cloudinary
                    uploadedAvatarUrl = await uploadAvatarToCloudinary(avatar);
                    updates.avatar = uploadedAvatarUrl;
                } else if (typeof avatar === 'string' && avatar.startsWith("https://res.cloudinary.com/")) {
                    // Keep existing Cloudinary URL
                    updates.avatar = avatar;
                } else {
                    throw { status: 400, message: "Invalid avatar format!" };
                }
            } catch (uploadError) {
                console.error("Avatar upload error:", uploadError);
                throw { status: 400, message: "Failed to upload avatar. Please try again." };
            }
        }

        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password").lean();

        if (!updatedUser) {
            throw { status: 404, message: "Failed to update user!" };
        }

        // Log user activity
        await logUserActivity(user.accountId, 'PROFILE_UPDATED', {
            ip: req ? req.ip : 'unknown',
            updatedFields: Object.keys(updates),
            timestamp: new Date()
        });

        // Get updated account info
        const updatedAccount = await Account.findById(user.accountId)
            .select("-password -resetPasswordToken -resetPasswordExpireAt -verificationToken")
            .lean();

        return {
            user: userDTO({ ...updatedUser, accountId: updatedAccount }),
            account: accountDTO(updatedAccount),
            message: "Profile updated successfully!"
        };

    } catch (error) {
        console.error("Error in updateUserService:", error.message);
        throw error;
    }
};


/**
 * Upload avatar image to Cloudinary
 * @param {string} imageData - Base64 image data or image URL
 * @param {object} options - Cloudinary upload options
 * @returns {string} Cloudinary secure URL
 */
const uploadAvatarToCloudinary = async (imageData, options = {}) => {
    try {
        if (!imageData) {
            throw { status: 400, message: "Image data is required!" };
        }
        const defaultOptions = {
            folder: "user_avatars",
            quality: "auto",
            fetch_format: "webp",
            width: 200,
            height: 200,
            crop: "fill",
            gravity: "face"
        };

        const uploadOptions = { ...defaultOptions, ...options };

        // Use your existing cloudinary upload function
        const result = await cloudinary.uploader.upload(imageData, uploadOptions);

        console.log(result)
        
        if (!result || !result.secure_url) {
            throw { status: 400, message: "Failed to upload image to Cloudinary!" };
        }

        return result.secure_url;

    } catch (error) {
        console.error("Error uploading avatar to Cloudinary:", error);
        throw { status: 400, message: "Avatar upload failed!" };
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

/**
 * Format bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size string
 */
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Get time ago string from date
 * @param {Date} date - Date to calculate from
 * @returns {string} Time ago string
 */
const getTimeAgo = (date) => {
    if (!date) return null;

    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
};

/**
 * Get processing status counts for analytics
 * @param {Array} files - Array of audio files
 * @returns {object} Status counts
 */
const getProcessingStatusCounts = (files) => {
    const statusCounts = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        detection_failed: 0
    };

    files.forEach(file => {
        const status = file.processingStatus || 'pending';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });

    return statusCounts;
};


// /**
//  * Helper function to clear authentication cookies
//  * @param {object} res - Express response object
//  */
const clearAuthCookies = (res) => {
    // Get the same domain used when setting cookies    
    const cookieConfig = {
        httpOnly: true,
        sameSite: SAMESITE,
        domain: DOMAIN,
        secure: SECURE
    };
    // Clear accessToken cookie
    res.clearCookie('accessToken', {
        ...cookieConfig,
        path: '/api', // Match the path used when setting
        
    });
    
    // Clear refreshToken cookie
    res.clearCookie('refreshToken', {
        ...cookieConfig,
        path: '/api/auth', // Match the path used when setting
    });
    
    console.log("Auth cookies cleared successfully");
};
