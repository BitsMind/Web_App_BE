import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter object
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
  pool: true, // Use pooled connections
  maxConnections: 5, // Maximum number of simultaneous connections
  maxMessages: 100, // Maximum number of messages to send per connection
  rateLimit: 20, // Max messages per second
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP connection error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
