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

import { testCollectionConnection, testProductConnection } from "./lib/cloudinary/cloudinary.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy - IMPORTANT: Add this to fix rate limiting behind proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Environment variables
const PORT = process.env.PORT || 5002;
const NODE_ENV = "development";
const allowedOrigin = NODE_ENV === "development" ? "http://localhost:3000" : null

// Security middleware
app.use(helmet()); // Helps secure Express apps with various HTTP headers (X-Content-Type-Options(MIME type sniffing), X-Frame-Options(clickjacking), Content-Security-Policy)
app.use(mongoSanitize({ 
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      // Patch here if necessary
      console.log(`Sanitized key: ${key} in request`);
    }
  })); // Prevents MongoDB Operator Injection
// Rate limiting to prevent brute force attacks or DDoS
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // Default to 15 minutes if not set
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Default to 100 requests if not set
  windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // Default to 15 minutes if not set
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Default to 100 requests if not set
  standardHeaders: true, // Send rate limit information in standard headers
  legacyHeaders: false // Do not use old headers like X-RateLimit-*
});

app.use('/api/', limiter); // Each IP is only allowed to send a maximum of 100 requests every 15 minutes to routes starting with /api/.

app.use(cors({
    origin: allowedOrigin, // Only allow requests from the domain defined in `allowedOrigin`
    credentials: true, // Allow sending cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "X-Requested-With"], 
    exposedHeaders: ["Set-Cookie"] // Allow client to read `Set-Cookie` header
}));

// Request parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); // Parse cookies from request
app.use(compression()); // Compress responses to speed up transmission

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: NODE_ENV }); //Helps check if the server is up and running.
});

// API routes
app.use("/api/auth/", authRoute);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
      success: false,
      message: `Not Found - ${req.originalUrl}`
  });
});

// Global error handler
/*Catch all errors in the application.
If it is a production environment, hide the error details (stack trace).
If it is a development environment, show the error details for easy debugging*/ 
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
      await connectMongoDB();
      
      // Start the server after successful DB connection
      app.listen(PORT, () => {
          console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
          console.log(`http://localhost:${PORT}`);
      });
  } catch (error) {
      console.error(`Failed to start server: ${error.message}`);
      process.exit(1);
  }
};

startServer();
