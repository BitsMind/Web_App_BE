import jwt from "jsonwebtoken"
import Account from "../../Auth/models/account.models.js";
import User from "../../User/models/user.models.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * Middleware for protecting routes based on user roles
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
export const protectRoute = (allowedRoles = []) => asyncHandler(async (req, res, next) => {
    // Check for token in cookies or Authorization header (for API clients) return 401 if no token
    const token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

    if (!token) {return res.status(401).json({success: false, error: "Unauthorized: Authentication required"})};

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // check token expiration
        const currentTimeStamp = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTimeStamp) {return res.status(401).json({success: false, error:"Unauthorized: Token expired"})};

        // Find account with projection (only fetch needed fields)
        const account = await Account.findOne({email: decoded.email}, {email: 1, userType: 1, isVerified: 1});
        if (!account) {return res.status(401).json({success: false, error:"Unauthorized: Account not found"})};

        // Check if account is verified
        if (!account.isVerified) {return res.status(403).json({success: false, error: "Forbidden: Account is not Verified"})};

        // Check role permissions
        if (allowedRoles.length > 0 && !allowedRoles.includes(account.userType)) { return res.status(403).json({success: false, error: "Forbidden: Insufficient permissions"})};

        // Add account to request object
        req.account = account;

        // Only fetch user data if needed based on role
        if (["USER", "ADMIN"].includes(account.userType)){
            const user = await User.findOne({accountId: account.id}).select("-password");
            if (user) {req.user = user}
        }
        next();
    } catch (error) {
        // Handle specific JWT errors with appropriate responses
        if (error.name === "JsonWebTokenError") {
        return res.status(401).json({success: false, error: "Unauthorized: Invalid token"})}
    
        if (error.name === "TokenExpiredError") {return res.status(401).json({success: false, error: "Unauthorized: Token expired"})}

        // For other errors, pass to global error handler
        next(error);
    }

})
