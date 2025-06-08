import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";


// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Check for required environment variables
const requiredEnvVars = [
  // Product Cloudinary
  "CLOUDINARY_PRODUCTS_CLOUD_NAME",
  "CLOUDINARY_PRODUCTS_API_KEY",
  "CLOUDINARY_PRODUCTS_API_SECRET",

  // Collection Cloudinary
  "CLOUDINARY_COLLECTIONS_CLOUD_NAME",
  "CLOUDINARY_COLLECTIONS_API_KEY",
  "CLOUDINARY_COLLECTIONS_API_SECRET"
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Configure Products Cloudinary Instance
export const productCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_PRODUCTS_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_PRODUCTS_API_KEY,
    api_secret: process.env.CLOUDINARY_PRODUCTS_API_SECRET,
    secure: true
  });
  return cloudinary;
  
}


// Configure Collections Cloudinary Instance
export const cloudinaryCollection = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_COLLECTIONS_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_COLLECTIONS_API_KEY,
    api_secret: process.env.CLOUDINARY_COLLECTIONS_API_SECRET,
    secure: true // Ensure HTTPS is always used
  });
  return cloudinary;
}

// Test connection for Collections Cloudinary
export const testCollectionConnection = async () => {
  try {
    const cloudinary = cloudinaryCollection();
    const result = await cloudinary.api.ping();
    console.log("Collection Cloudinary connection successful");
    return { 
      success: true, 
      message: "Collection Cloudinary connection successful", 
      result,
      type: "collections"
    };
  } catch (error) {
    console.error("Collection Cloudinary connection failed:", error.message);
    return { 
      success: false, 
      message: "Collection Cloudinary connection failed", 
      error,
      type: "collections"
    };
  }
}

// Test connection for Collections Cloudinary
export const testProductConnection = async () => {
  try {
    const cloudinary = productCloudinary()
    const result = await cloudinary.api.ping();
    console.log("Product Cloudinary connection successful");
    return { 
      success: true, 
      message: "Product Cloudinary connection successful", 
      result,
      type: "products"
    };
  } catch (error) {
    console.error("Product Cloudinary connection failed:", error.message);
    return { 
      success: false, 
      message: "Product Cloudinary connection failed", 
      error,
      type: "products"
    };
  }
}



export default { productCloudinary, cloudinaryCollection };