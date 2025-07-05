import axios from "axios";
import { audioCloudinary } from "../../../backend/lib/cloudinary/cloudinary.js";
import User from "../../User/models/user.models.js";
import { audioFileDTO, audioFileUserDTO, watermarkDetectionDTO } from "../dto/audio.dto.js";
import AudioFile from "../model/audioFile.model.js";
import DownloadLog from "../model/DownloadLog.model.js";
import dotenv from "dotenv";
import path from "path";


// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Configuration
const PYTHON_API_BASE_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
const PYTHON_API_TIMEOUT = 60000; // 60 seconds


const cloudinary = audioCloudinary();

/**
 * Get all audio files with pagination support
 * @param {number} page - Page number
 * @param {number} limit - Number of items per page
 * @param {boolean} all - Whether to get all audio files
 * @param {boolean} includeFailed - Whether to include failed audio files
 * @returns {Object} Audio files data with pagination info
 */
export const getAllAudioFileService = async (page, limit, all = false, includeFailed = false) => {
    try {
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;

        if (pageNumber < 1 || limitNumber < 1) {
            throw { status: 400, message: "Invalid pagination parameters" };
        }

        let filter = {};

        // If not requesting failed audio files, exclude them
        if (!includeFailed) {
            filter.processingStatus = { $ne: "failed" };
        }

        // Get total count for pagination
        const totalAudioFiles = await AudioFile.countDocuments(filter);

        // Handle empty result case
        if (totalAudioFiles === 0) {
            return {
                audioFiles: [],
                totalPages: 0,
                currentPage: pageNumber,
                totalAudioFiles: 0
            };
        }

        let audioFiles;

        if (all) {
            // Fetch all audio files without pagination
            audioFiles = await AudioFile.find(filter)
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .lean();
        } else {
            // Normal paginated fetch
            const skip = (pageNumber - 1) * limitNumber;
            audioFiles = await AudioFile.find(filter)
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean();
        }

        return {
            audioFiles: audioFiles.map((audioFile) => audioFileDTO(audioFile)),
            totalPages: all ? 1 : Math.ceil(totalAudioFiles / limitNumber),
            currentPage: all ? 1 : pageNumber,
            totalAudioFiles
        };
    } catch (error) {
        console.error("Error in getAllAudioFileService:", error.message);
        throw error;
    }
};

/**
 * Get all audio files for user interface
 * @param {string} userId - User ID to filter user's audio files
 * @returns {Object} Audio files data for users
 */
export const getAllAudioFileUserService = async (userId = null) => {
    try {
        let filter = { processingStatus: { $in: ["done", "processing"] } };
        
        // If userId is provided, filter by user
        if (userId) {
            filter.uploadedBy = userId;
        }



        const audioFiles = await AudioFile.find(filter)
            .populate('uploadedBy', 'name email')
            .select('-__v')
            .lean()
            .exec();

        // Check if audio files exist
        if (!audioFiles || audioFiles.length === 0) {
            return {
                audioFiles: [],
                total: 0,
                message: 'No audio files found'
            };
        }



        return {
            audioFiles: audioFiles.map((audioFile) => audioFileUserDTO(audioFile)),
            total: audioFiles.length
        };
    } catch (error) {
        console.error("Error in getAllAudioFileUserService:", error.message);
        throw error;
    }
};

/**
 * Create a new audio file record
 * @param {Object} newAudioFile - Audio file data
 * @param {string} userId - User ID who uploaded the file
 * @returns {Object} Created audio file
 */

export const createAudioFileService = async (newAudioFile, userId) => {
    try {
        const { fileName, fileSize, format, watermarkMessage, fileBuffer, filePath, fileBase64 } = newAudioFile;

        // Validate required fields
        if (!fileName) throw { status: 400, message: "File name is required!" };
        if (!fileSize || typeof fileSize !== 'number') throw { status: 400, message: "Valid file size is required!" };
        if (!format) throw { status: 400, message: "File format is required!" };
        if (!userId) throw { status: 400, message: "User ID is required!" };

        if (!fileBuffer && !filePath && !fileBase64) {
            throw { status: 400, message: "Audio file data is required! Provide fileBuffer, filePath, or fileBase64" };
        }

        const allowedFormats = ['mp3', 'wav', 'flac', 'mp4', 'm4a'];
        if (!allowedFormats.includes(format.toLowerCase())) {
            throw { status: 400, message: `Unsupported format. Allowed formats: ${allowedFormats.join(', ')}` };
        }

        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found!" };
        }

        let audioDataToUpload;
        if (fileBuffer) {
            audioDataToUpload = `data:audio/${format};base64,${fileBuffer.toString('base64')}`;
        } else if (fileBase64) {
            audioDataToUpload = fileBase64.startsWith('data:') ? fileBase64 : `data:audio/${format};base64,${fileBase64}`;
        } else if (filePath) {
            audioDataToUpload = filePath;
        }

        // === 1. Upload to Cloudinary
        const audioUrl = await uploadAudioToCloudinary(audioDataToUpload, format, {
            resource_type: "video",
            folder: "audio_files"
        });

        // === 2. Create DB record (with pending status)
        const audioFile = await AudioFile.create({
            fileName,
            filePath: audioUrl,
            fileSize,
            format: format.toLowerCase(),
            watermarkMessage: watermarkMessage || null,
            uploadedBy: userId,
            processingStatus: "pending"
        });

        // === 3. Call Python API to watermark
        try {
            const watermarkedResponse = await axios.post(`${PYTHON_API_BASE_URL}/add-watermark-url`, {
                audioUrl: audioUrl,
                watermarkMessage: watermarkMessage || ''
            });

            const { base64_audio, decoded_message, status } = watermarkedResponse.data;
            if (status !== "success") {
                throw { status: 500, message: "Watermarking failed on Python BE" };
            }

            const watermarkedUrl = await uploadAudioToCloudinary(
                `data:audio/${format};base64,${base64_audio}`,
                format,
                {
                resource_type: "video",
                folder: "audio_files"
                }
            )

            // Update DB record with watermark results
            audioFile.filePath = watermarkedUrl; // or save in separate field
            audioFile.watermarkMessage = decoded_message;
            audioFile.processingStatus = "completed";
            audioFile.isWatermarked = "true";
            await audioFile.save();
        } catch (error) {
            console.error("❌ Error calling Python API:", error.message);
            audioFile.processingStatus = "failed";
            await audioFile.save();
        }

        await audioFile.populate('uploadedBy', 'name email');
        return audioFileDTO(audioFile);
    } catch (error) {
        console.error("Error in createAudioFileService:", error.message);
        throw error;
    }
};

export const detectWatermarkService = async (audioFile) => {
  let uploadedAudioUrl;

  try {
    const format = audioFile.format || "mp3";

    // === 1. Upload to Cloudinary ===
    uploadedAudioUrl = await uploadAudioToCloudinary(audioFile, format, {
      resource_type: "video",
      folder: "audio_detect"
    });


    // === 2. Update status to "detecting"
    // audioFile.filePath = uploadedAudioUrl
    // audioFile.processingStatus = "detecting";
    // await audioFile.save();


    // console.log(`🔍 Starting watermark detection for: ${audioFile.fileName}`);

    // === 3. Call Python API
    const response = await axios.post(
      `${PYTHON_API_BASE_URL}/detect-watermark`,
      { audioUrl: uploadedAudioUrl },
      {
        timeout: PYTHON_API_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("🐍 Python API Response:", response.data);

    const { status, watermark_detected, confidence, decoded_message } = response.data;

    if (status !== "done") {
      console.error("Python detection failed response:", response.data);
      throw { status: 500, message: "Watermark detection failed on Python backend" };
    }

    // === 4. Save results to DB
    // audioFile.watermarkDetected = watermark_detected;
    // audioFile.confidence = confidence || 0;
    // audioFile.detectedMessage = decoded_message || null;
    // audioFile.detectionTimestamp = new Date();
    // audioFile.processingStatus = "completed";
    // await audioFile.save();
    // await audioFile.populate('uploadedBy', 'name email');

    // console.log(`✅ Detection completed for: ${audioFile.fileName}`);
    console.log(`📊 Detected=${watermark_detected}, Confidence=${confidence}`);

    return watermarkDetectionDTO(audioFile);

  } catch (error) {
    // === 5. Fallback update to mark failure
    if (audioFile?._id) {
      try {
        await AudioFile.findByIdAndUpdate(audioFile._id, {
          processingStatus: "detection_failed",
          detectionTimestamp: new Date()
        });
      } catch (updateError) {
        console.error("❌ Failed to mark detection_failed:", updateError);
      }
    }

    // === 6. Error Classification
    if (error.response?.status === 404) {
      throw { status: 404, message: "Audio file not accessible or Python API missing" };
    } else if (error.response?.status >= 500) {
      throw { status: 500, message: "Python API server error during detection" };
    } else if (error.code === 'ECONNREFUSED') {
      throw { status: 503, message: "Python server is not running" };
    } else if (error.code === 'ETIMEDOUT') {
      throw { status: 408, message: "Detection request timed out" };
    }

    console.error("❌ Error in detectWatermarkService:", error.message);
    throw error;
  }
};

/**
 * Edit an existing audio file
 * @param {string} audioFileId - Audio file ID
 * @param {Object} updateData - Updated audio file data
 * @param {string} userId - User ID making the update
 * @returns {Object} Updated audio file
 */
export const editAudioFileService = async (audioFileId, updateData, userId) => {
    console.log(audioFileId, updateData)
    try {
        if (!audioFileId) {
            throw { status: 400, message: "Audio file ID is required!" };
        }

        if (!userId) {
            throw { status: 400, message: "User ID is required!" };
        }

        let audioFile = await AudioFile.findById(audioFileId).populate('uploadedBy', 'name email');
        if (!audioFile) {
            throw { status: 404, message: "Audio file not found!" };
        }

        // Check if user owns the audio file or is admin
        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found!" };
        }

        if (audioFile.uploadedBy._id.toString() !== userId && user.role !== 'admin') {
            throw { status: 403, message: "You don't have permission to edit this audio file!" };
        }

        const { fileName, watermarkMessage, isWatermarked, processingStatus } = updateData;

        // Prevent duplicate file name for the same user
        if (fileName && fileName !== audioFile.fileName) {
            const existingAudioFile = await AudioFile.findOne({ 
                fileName, 
                uploadedBy: audioFile.uploadedBy,
                _id: { $ne: audioFileId } 
            });
            if (existingAudioFile) {
                throw { status: 409, message: "An audio file with this name already exists!" };
            }
        }

        const updates = {};
        if (fileName) updates.fileName = fileName;
        if (typeof isWatermarked !== 'undefined') updates.isWatermarked = isWatermarked;
        if (watermarkMessage !== undefined) updates.watermarkMessage = watermarkMessage;
        if (processingStatus && ['pending', 'processing', 'done', 'failed'].includes(processingStatus)) {
            updates.processingStatus = processingStatus;
            if (processingStatus === 'done') {
                updates.processedAt = new Date();
            }
        }

        // Update audio file in a single operation
        const updatedAudioFile = await AudioFile.findByIdAndUpdate(
            audioFileId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('uploadedBy', 'name email');

        return audioFileDTO(updatedAudioFile);
    } catch (error) {
        console.error("Error in editAudioFileService:", error.message);
        throw error;
    }
};

/**
 * Delete an audio file
 * @param {string} audioFileId - Audio file ID
 * @param {string} userId - User ID making the deletion
 * @returns {Object} Deletion confirmation message
 */
export const deleteAudioFileService = async (audioFileId, userId) => {
    try {
        if (!audioFileId) {
            throw { status: 400, message: "Audio file ID is required!" };
        }

        if (!userId) {
            throw { status: 400, message: "User ID is required!" };
        }

        const audioFile = await AudioFile.findById(audioFileId).populate('uploadedBy', 'name email');
        if (!audioFile) {
            throw { status: 404, message: "Audio file not found!" };
        }

        // Check if user owns the audio file or is admin
        const user = await User.findById(userId);
        if (!user) {
            throw { status: 404, message: "User not found!" };
        }

        // Delete audio file from Cloudinary
        if (audioFile.filePath) {
            try {
                const urlParts = audioFile.filePath.split("/");
                const filenameWithExt = urlParts[urlParts.length - 1];
                const publicId = `audio_files/${filenameWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
            } catch (error) {
                console.error("Error deleting audio file from Cloudinary:", error);
            }
        }
        await audioFile.deleteOne();

        return { message: "Audio file deleted successfully" };
    } catch (error) {
        console.error("Error in deleteAudioFileService:", error.message);
        throw error;
    }
};

/**
 * Get audio file by ID
 * @param {string} audioFileId - Audio file ID
 * @param {string} userId - User ID requesting the file
 * @returns {Object} Audio file data
 */
export const getAudioFileByIdService = async (audioFileId, userId) => {
    try {
        if (!audioFileId) {
            throw { status: 400, message: "Audio file ID is required!" };
        }

        const audioFile = await AudioFile.findById(audioFileId).populate('uploadedBy', 'name email');
        if (!audioFile) {
            throw { status: 404, message: "Audio file not found!" };
        }

        // Check if user owns the audio file or is admin
        if (userId) {
            const user = await User.findById(userId);
            if (user && (audioFile.uploadedBy._id.toString() !== userId && user.role !== 'admin')) {
                throw { status: 403, message: "You don't have permission to access this audio file!" };
            }
        }

        return audioFileDTO(audioFile);
    } catch (error) {
        console.error("Error in getAudioFileByIdService:", error.message);
        throw error;
    }
};

/**
 * Update processing status of audio file
 * @param {string} audioFileId - Audio file ID
 * @param {string} status - New processing status
 * @param {string} watermarkMessage - Watermark message if applicable
 * @returns {Object} Updated audio file
 */
export const updateProcessingStatusService = async (audioFileId, status, watermarkMessage = null) => {
    try {
        if (!audioFileId) {
            throw { status: 400, message: "Audio file ID is required!" };
        }

        if (!['pending', 'processing', 'completed', 'failed'].includes(status)) {
            throw { status: 400, message: "Invalid processing status!" };
        }

        const updates = { processingStatus: status };
        
        if (status === 'completed') {
            updates.processedAt = new Date();
            if (watermarkMessage) {
                updates.isWatermarked = true;
                updates.watermarkMessage = watermarkMessage;
            }
        }

        const updatedAudioFile = await AudioFile.findByIdAndUpdate(
            audioFileId,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('uploadedBy', 'name email');

        if (!updatedAudioFile) {
            throw { status: 404, message: "Audio file not found!" };
        }

        return audioFileDTO(updatedAudioFile);
    } catch (error) {
        console.error("Error in updateProcessingStatusService:", error.message);
        throw error;
    }
};

/**
 * Generate secure download URL with access control
 * @param {string} audioFileId - Audio file ID
 * @param {string} userId - User ID requesting download
 * @returns {Object} Download URL and file info
 */
export const generateDownloadUrlService = async (audioFileId, userId) => {
    try {
        if (!audioFileId) {
            throw { status: 400, message: "Audio file ID is required!" };
        }

        const audioFile = await AudioFile.findById(audioFileId).populate('uploadedBy', 'name email');
        if (!audioFile) {
            throw { status: 404, message: "Audio file not found!" };
        }

        // Check permissions
        if (userId) {
            const user = await User.findById(userId);
            if (user && (audioFile.uploadedBy._id.toString() !== userId && user.role !== 'admin')) {
                throw { status: 403, message: "You don't have permission to download this audio file!" };
            }
        }

        // Check if file is ready for download
        if (audioFile.processingStatus !== 'done') {
            throw { status: 400, message: "Audio file is not ready for download!" };
        }

        // Generate temporary signed URL (if using cloud storage)
        const downloadUrl = await generateSignedUrl(audioFile.filePath);

        // Log download activity
        await logDownloadActivity(audioFileId, userId);

        return {
            downloadUrl,
            fileName: audioFile.fileName,
            fileSize: audioFile.fileSize,
            format: audioFile.format,
            expiresIn: '1 hour' // URL expires in 1 hour
        };
    } catch (error) {
        console.error("Error in generateDownloadUrlService:", error.message);
        throw error;
    }
};
// Helper Functions

/**
 * Generate signed URL for secure download
 * @param {string} filePath - Cloud storage file path
 * @returns {string} Signed URL
 */
const generateSignedUrl = async (filePath) => {
    try {
        // For Cloudinary
        const timestamp = Math.round(new Date().getTime() / 1000) + 3600; // 1 hour expiry
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            resource_type: 'auto'
        }, process.env.CLOUDINARY_API_SECRET);

        return `${filePath}?timestamp=${timestamp}&signature=${signature}`;
    } catch (error) {
        throw { status: 500, message: "Failed to generate download URL" };
    }
};

/**
 * Upload audio file to Cloudinary
 * @param {string} audioData - Base64 audio data or file path
 * @param {Object} options - Upload options
 * @returns {string} Uploaded audio file URL
 */
const uploadAudioToCloudinary = async (audioData, format, options = {}) => {
    if (!audioData) {
        throw { status: 400, message: "No audio data provided!" };
    }

    const defaultOptions = {
        resource_type: "auto",
        folder: "audio_files",
        fetch_format: format,
        quality: "auto"
    };

    const uploadOptions = { ...defaultOptions, ...options };

    try {
        const result = await cloudinary.uploader.upload(audioData, uploadOptions);
        return result.secure_url;
    } catch (error) {
        console.error("Error uploading audio to Cloudinary:", error);
        throw { status: 400, message: "Failed to upload audio file!" };
    }
};

/**
 * Log download activity
 * @param {string} audioFileId - Audio file ID
 * @param {string} userId - User ID
 * @param {string} type - Download type (single/bulk)
 */
const logDownloadActivity = async (audioFileId, userId, type = 'single') => {
    try {
        // Create download log entry
        await DownloadLog.create({
            audioFileId,
            userId,
            downloadType: type,
            downloadedAt: new Date(),
            ipAddress: null, // You can pass this from the controller
            userAgent: null  // You can pass this from the controller
        });
    } catch (error) {
        console.error("Error logging download activity:", error);
        // Don't throw error here as download should still work
    }
};