import express from "express"
import dotenv from "dotenv";
import connectMongoDB from "./lib/db/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import compression from "compression";

// Route imports
import authRoute from "../appModule/Auth/routes/auth.routes.js"
import audioRoute from "../appModule/AudioFile/routes/audio.routes.js"
import {testAudioConnection, testAvatarConnection} from "./lib/cloudinary/cloudinary.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy - IMPORTANT: Add this to fix rate limiting behind proxies
app.set('trust proxy', 1);

// Environment variables
const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || "development";

// FIXED: Updated allowed origins
const allowedOrigins = [
    "http://localhost:3000", // Development
    "https://voicemark-web-app.onrender.com", // Production frontend
    "https://web-app-be-dylr.onrender.com" // Your backend URL (for self-requests)
];

console.log("Allowed origins:", allowedOrigins);

// FIXED: CORS configuration - place BEFORE other middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type", 
        "Authorization", 
        "x-request-id", 
        "X-Requested-With",
        "Accept",
        "Origin"
    ],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // Support legacy browsers
    preflightContinue: false // Handle preflight requests
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-request-id,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Security middleware - AFTER CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests
}));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for preflight requests
    skip: (req) => req.method === 'OPTIONS'
});

app.use('/api/', limiter);

// Request parsing middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(compression());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        environment: NODE_ENV,
        allowedOrigins: allowedOrigins
    });
});

// API routes
app.use("/api/auth/", authRoute);
app.use("/api/audio/", audioRoute);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Not Found - ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: NODE_ENV === 'production' ? 'Server Error' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack
    });
});

// Server initialization
const startServer = async () => {
    try {
        await testAudioConnection();
        await testAvatarConnection();
        await connectMongoDB();
        
        app.listen(PORT, () => {
            console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();