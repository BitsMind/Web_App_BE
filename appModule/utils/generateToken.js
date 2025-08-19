import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateTokens = async (accountId, email, req, res) => {
    // Validate required environment variables
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined in the environment variables");
    }

    // Create a fingerprint from user agent and IP (helps prevent token theft)
    const fingerprint = createFingerPrint(req);

    try {
        // Generate access token with short lifespan
        const accessToken = jwt.sign(
            {
                accountId, 
                email, 
                type: 'access', 
                jti: crypto.randomUUID() // Unique token ID
            },
            process.env.ACCESS_TOKEN_SECRET,
            { 
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30m", // Match your env config
                audience: process.env.TOKEN_AUDIENCE || "jennyfairy.store",
                issuer: process.env.TOKEN_ISSUER || "jennyfairy.store-auth" 
            }
        );

        // Generate refresh token with fingerprint to validate client
        const refreshToken = jwt.sign(
            { 
                accountId, 
                email, 
                type: 'refresh',
                fingerprint,
                jti: crypto.randomUUID() // Unique token ID
            },
            process.env.REFRESH_TOKEN_SECRET,
            { 
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
                audience: process.env.TOKEN_AUDIENCE || "jennyfairy.store",
                issuer: process.env.TOKEN_ISSUER || "jennyfairy.store-auth" 
            }
        );

        // Base cookie configuration
        const cookieConfig = {
            httpOnly: true,
            sameSite: process.env.COOKIE_SAME_SITE || "Lax",
            secure: process.env.NODE_ENV === "production", // Only secure in production
            // Remove domain in development, use it only in production
            ...(process.env.NODE_ENV === "production" && { 
                domain: process.env.COOKIE_DOMAIN || ".jennyfairy.store" 
            })
        };

        // Set access token cookie
        res.cookie("accessToken", accessToken, {
            ...cookieConfig,
            maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
            path: "/api" // Restrict to API routes
        });

        // Set refresh token cookie
        res.cookie("refreshToken", refreshToken, {
            ...cookieConfig,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            path: "/api/auth" // Restrict to auth endpoints only
        });

        console.log("Cookies set successfully:", {
            accessTokenSet: true,
            refreshTokenSet: true,
            environment: process.env.NODE_ENV,
            cookieConfig
        });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("Token generation error:", error);
        throw new Error("Failed to generate authentication tokens");
    }
};

/**
 * Creates a fingerprint hash based on client information
 * @param {object} req - Express request object
 * @returns {string} Fingerprint hash
 */
function createFingerPrint(req) {
    const userAgent = req.headers['user-agent'] || ''; // Get information about the user's browser
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || ''; // Better IP detection

    return crypto.createHash('sha256')
        .update(userAgent + ipAddress + (process.env.FINGERPRINT_SECRET || 'fallback-secret'))
        .digest('hex');
}