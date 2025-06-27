import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";


// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Check for required environment variables
const requiredEnvVars = [
  // Audio Cloudinary
  "AUDIO_CLOUD_NAME",
  "AUDIO_API_KEY",
  "AUDIO_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Configure Audio Cloudinary Instance
export const audioCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.AUDIO_CLOUD_NAME,
    api_key: process.env.AUDIO_API_KEY,
    api_secret: process.env.AUDIO_API_SECRET,
    secure: true
  });
  return cloudinary;
  
}


// Test connection for Audio Cloudinary
export const testAudioConnection = async () => {
  try {
    const cloudinary = audioCloudinary()
    const result = await cloudinary.api.ping();
    console.log("Audio Cloudinary connection successful");
    return { 
      success: true, 
      message: "Audio Cloudinary connection successful", 
      result,
      type: "audio"
    };
  } catch (error) {
    console.error("Audio Cloudinary connection failed:", error.message);
    return { 
      success: false, 
      message: "Audio Cloudinary connection failed", 
      error,
      type: "audio"
    };
  }
}



export default testAudioConnection;