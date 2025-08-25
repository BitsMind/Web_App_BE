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
import {testAudioConnection,  testAvatarConnection}  from "./lib/cloudinary/cloudinary.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy - IMPORTANT: Add this to fix rate limiting behind proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Environment variables
const PORT = process.env.PORT || 5002;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration - Fixed
const allowedOrigins = [
  NODE_ENV === "development" ? "http://localhost:3000" : "https://www.markmyvoices.com/",
  "https://www.markmyvoices.com", // Always allow production domain
];
 
const PYTHON_API_BASE_URL =  NODE_ENV === "production" ? process.env.PYTHON_API_URL : 'http://127.0.0.1:8080';

console.log(PYTHON_API_BASE_URL)

// Add development origins if in development
if (NODE_ENV === "development") {
  allowedOrigins.push(
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000"
  );
}

console.log("Allowed origins:", allowedOrigins);

// CORS middleware - MUST be before other middleware
app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow sending cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-request-id", 
      "X-Requested-With",
      "Accept",
      "Origin"
    ], 
    exposedHeaders: ["Set-Cookie"], // Allow client to read `Set-Cookie` header
    optionsSuccessStatus: 200 // For legacy browser support
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable if causing issues with CORS
  contentSecurityPolicy: false, // Disable if interfering with your app
}));
app.use(mongoSanitize()); // Prevents MongoDB Operator Injection

// Rate limiting - Fixed duplicate configuration
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // 100 requests per window
  standardHeaders: true, // Send rate limit information in standard headers
  legacyHeaders: false, // Do not use old headers like X-RateLimit-*
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});

app.use('/api/', limiter);

// Request parsing middleware
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // Parse cookies from request
app.use(compression()); // Compress responses to speed up transmission

// Health check endpoint
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
      // Connect to MongoDB & Cloudinary first
      await testAudioConnection()
      await testAvatarConnection()
      await connectMongoDB();
      
      // Start the server after successful DB connection
      app.listen(PORT, () => {
          console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
          console.log(`http://localhost:${PORT}`);
          console.log(`Allowed CORS origins:`, allowedOrigins);
      });
  } catch (error) {
      console.error(`Failed to start server: ${error.message}`);
      process.exit(1);
  }
};

startServer();