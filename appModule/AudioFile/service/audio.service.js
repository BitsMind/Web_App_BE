import axios from "axios";
import { audioCloudinary } from "../../../backend/lib/cloudinary/cloudinary.js";
import User from "../../User/models/user.models.js";
import { audioFileDTO, audioFileUserDTO } from "../dto/audio.dto.js";
import AudioFile from "../model/audioFile.model.js";
import WatermarkedMessage from "../../AudioFile/model/watermarkedMessage.model.js";
import DownloadLog from "../model/DownloadLog.model.js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const NODE_ENV = process.env.NODE_ENV || "development";
// Configuration
const PYTHON_API_BASE_URL =  NODE_ENV === "production" ? process.env.PYTHON_API_URL : 'http://127.0.0.1:8080';
const PYTHON_API_TIMEOUT = 120000; // 2 minutes


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
        let filter = { processingStatus: { $in: ["completed", "processing"] } };
        
        // If userId is provided, filter by user
        if (userId) {
            filter.uploadedBy = userId;
        }



        const audioFiles = await AudioFile.find(filter)
          .sort({createdAt: -1})
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
 * Create a new audio file record with enhanced comparison plot support
 * @param {Object} newAudioFile - Audio file data
 * @param {string} userId - User ID who uploaded the file
 * @returns {Object} Created audio file with comparison plot
 */

export const createAudioFileService = async (newAudioFile, userId) => {
  try {
    const { fileName, fileSize, format, watermarkMessage, fileBuffer, filePath, fileBase64 } = newAudioFile;

    if (watermarkMessage && watermarkMessage.length > 500) {
      throw { status: 400, message: "Watermark message cannot exceed 500 characters" };
    }

    if (!fileName) throw { status: 400, message: "File name is required!" };
    if (!fileSize) throw { status: 400, message: "File size is required!" };
    if (typeof fileSize !== 'number') throw { status: 400, message: "Valid file size is required!" };
    if (!format) throw { status: 400, message: "File format is required!" };
    if (!userId) throw { status: 400, message: "User ID is required!" };

    if (!fileBuffer && !filePath && !fileBase64) {
      throw {
        status: 400,
        message: "Audio file data is required! Provide fileBuffer, filePath, or fileBase64"
      };
    }

    const allowedFormats = ['mp3', 'wav', 'flac', 'mp4', 'm4a'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      throw {
        status: 400,
        message: `Unsupported format. Allowed formats: ${allowedFormats.join(', ')}`
      };
    }

    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: "User not found!" };

    let audioDataToUpload;
    if (fileBuffer) {
      audioDataToUpload = `data:audio/${format};base64,${fileBuffer.toString('base64')}`;
    } else if (fileBase64) {
      audioDataToUpload = fileBase64.startsWith('data:') ? fileBase64 : `data:audio/${format};base64,${fileBase64}`;
    } else if (filePath) {
      audioDataToUpload = filePath;
    }

    const audioUrl = await uploadAudioToCloudinary(audioDataToUpload, format, {
      resource_type: "video",
      folder: "audio_files",
      fetch_format: 'wav'
    });

    // Determine the watermark message to use
    let finalWatermarkMessage;
    let shouldWatermark = true;

    if (!watermarkMessage || watermarkMessage.trim() === '') {
      // No watermark message provided - use owner info as default
      finalWatermarkMessage = `Owner: ${user.name || 'Unknown'} (ID: ${userId})`;
      console.log(`📝 No watermark message provided, using default: "${finalWatermarkMessage}"`);
    } else if (watermarkMessage.length < 2) {
      // Watermark message too short - skip watermarking
      finalWatermarkMessage = null;
      shouldWatermark = false;
      console.log(`⚠️ Watermark message too short (${watermarkMessage.length} chars), skipping watermarking`);
    } else {
      // Use provided watermark message
      finalWatermarkMessage = watermarkMessage;
      console.log(`📝 Using provided watermark message: "${finalWatermarkMessage}"`);
    }

    const audioFile = await AudioFile.create({
      fileName,
      filePath: audioUrl,
      fileSize,
      format: format.toLowerCase(),
      watermarkMessage: finalWatermarkMessage,
      uploadedBy: userId,
      processingStatus: "pending"
    });

    try {
      // 🔍 Check if audio file already has watermark
      try {
        console.log("🔍 Checking if audio file already contains watermark...");
        const detectionResponse = await axios.post(
          `${PYTHON_API_BASE_URL}/detect-watermark`,
          { audioUrl: audioUrl },
          {
            timeout: PYTHON_API_TIMEOUT || 30000,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const { status, watermark_detected, decoded_message, confidence = 0.0 } = detectionResponse.data;

        if (status === "done" && watermark_detected && confidence >= 0.5) {
          console.log(`⚠️ Audio file already contains watermark: ${decoded_message}`);
          
          // Check if this watermark belongs to current user
          let existingWatermark = null;
          try {
            existingWatermark = await WatermarkedMessage.findOne({ _id: decoded_message })
              .select('message createdAt createdBy')
              .populate('createdBy', 'name _id');
          } catch (dbError) {
            console.error("❌ Failed to fetch existing watermark:", dbError.message);
          }

          if (existingWatermark) {
            console.log(existingWatermark.createdBy._id.toString() === userId);

            if (existingWatermark.createdBy._id.toString() === userId) {
              // Same user's watermark - update audioFile and return
              audioFile.filePath = audioUrl;
              audioFile.watermarkMessage = decoded_message;
              audioFile.watermarkedMessageId = decoded_message; // Store the binary ID directly
              audioFile.processingStatus = "completed";
              audioFile.isWatermarked = true;
              audioFile.confidence = confidence;
              audioFile.detectedMessage = decoded_message;
              audioFile.detectionTimestamp = new Date();
              await audioFile.save();

              await audioFile.populate('uploadedBy', 'name email');
              return audioFileDTO(audioFile);
            } else {
              // Different user's watermark - throw error with owner name
              const ownerName = existingWatermark.createdBy.name || 'Unknown User';
              throw { 
                status: 400, 
                message: `Audio file already contains watermark owned by ${ownerName}. Cannot proceed with watermarking.` 
              };
            }
          } else {
            // Watermark detected but no record found in database
            throw { 
              status: 400, 
              message: "Audio file already contains an unregistered watermark. Cannot proceed with watermarking." 
            };
          }
        }
        
        console.log("✅ No existing watermark detected, proceeding with watermarking...");
      } catch (detectionError) {
        // Only throw the "other user's watermark" error if it was explicitly thrown above
        if (detectionError.status === 400 && 
            (detectionError.message.includes("watermark owned by") || 
             detectionError.message.includes("unregistered watermark"))) {
          throw detectionError;
        }
        
        // For all other detection errors (API failures, network issues, etc.), just log and continue
        console.log("⚠️ Watermark detection failed, proceeding with watermarking anyway:", detectionError.message);
        // Continue to watermarking process - don't throw error
      }

      // Skip watermarking if no valid message
      if (!shouldWatermark) {
        console.log("⏭️ Skipping watermarking - no valid watermark message");
        audioFile.processingStatus = "completed";
        audioFile.isWatermarked = false;
        await audioFile.save();
        
        await audioFile.populate('uploadedBy', 'name email');
        return audioFileDTO(audioFile);
      }

      let watermarkedResponse;
      let payload;

      // Generate 16-byte binary watermark ID
      const watermarkBinaryId = await generate16BitBinaryString();
      
      // Use URL endpoint for watermarking
      payload = {
        audioUrl: audioUrl,
        watermarkMessage: watermarkBinaryId
      };
      console.log(`🔄 Using URL watermarking with binary ID: "${watermarkBinaryId}"`);
      console.log(`📝 Watermark will contain: "${finalWatermarkMessage}"`);

      // Call watermarking endpoint
      watermarkedResponse = await axios.post(`${PYTHON_API_BASE_URL}/add-watermark-url`, payload, {
        timeout: PYTHON_API_TIMEOUT || 30000,
        headers: { 'Content-Type': 'application/json' }
      });

      const responseData = watermarkedResponse.data;
      const { 
        status, 
        base64_audio, 
        decoded_message, 
        audio_info
      } = responseData;

      if (status !== "success") {
        const errorMsg = responseData.error || "Watermarking failed on Python API";
        
        // Check if it's the "already watermarked" error from Python API
        if (errorMsg.includes("already watermarked") || errorMsg.includes("already contains watermark")) {
          console.log("⚠️ Python API detected existing watermark, handling gracefully");
          audioFile.processingStatus = "failed";
          audioFile.errorMessage = "Audio file already contains watermark - use unwatermarked audio";
          await audioFile.save();
          
          throw { 
            status: 400, 
            message: "Audio file already contains watermark. Please use original unwatermarked audio file." 
          };
        }
        
        throw { status: 500, message: errorMsg };
      }

      console.log("✅ Watermarking successful, processing results...");

      // Upload watermarked audio to Cloudinary
      const watermarkedUrl = await uploadAudioToCloudinary(
        `data:audio/${format};base64,${base64_audio}`,
        format,
        {
          resource_type: "video",
          folder: "audio_files",
          fetch_format: 'wav'
        }
      );

      // Create WatermarkedMessage with binary ID and the actual message content
      const watermarkedMessage = await WatermarkedMessage.create({
        _id: watermarkBinaryId,
        audioFile: audioFile._id,
        message: finalWatermarkMessage, // This contains the actual watermark content
        createdBy: userId,
        approved: true,
        approvedAt: new Date(),
        messageType: !watermarkMessage || watermarkMessage.trim() === '' ? 'owner_default' : 'user_provided' // Track the source
      });

      // Update audioFile with watermarking data
      audioFile.filePath = watermarkedUrl;
      audioFile.watermarkMessage = watermarkBinaryId;
      audioFile.watermarkedMessageId = watermarkBinaryId; // Store the binary ID directly
      audioFile.processingStatus = "completed";
      audioFile.isWatermarked = true;
      audioFile.detectedMessage = decoded_message;
      audioFile.detectionTimestamp = new Date();

      // Save enhanced audio info
      if (audio_info) {
        audioFile.audioInfo = {
          originalSampleRate: audio_info.original_sample_rate,
          processedSampleRate: audio_info.processed_sample_rate,
          watermarkConfidence: audio_info.watermark_confidence,
          channels: audio_info.channels,
          samples: audio_info.samples
        };
        
        // Update confidence and metadata
        audioFile.confidence = audio_info.watermark_confidence;
        audioFile.metadata = audioFile.metadata || {};
        audioFile.metadata.duration = audio_info.duration_seconds;
        audioFile.metadata.sampleRate = audio_info.processed_sample_rate;
        audioFile.metadata.channels = audio_info.channels; 
      }

      await audioFile.save();

      // Update user storage
      await User.findByIdAndUpdate(
        userId,
        { $inc: { usedStorage: fileSize } }
      );

      console.log("✅ Audio file processing completed!");
      console.log(`📋 Watermark summary:
        - Binary ID: ${watermarkBinaryId}
        - Message: ${finalWatermarkMessage}
        - Type: ${!watermarkMessage || watermarkMessage.trim() === '' ? 'Owner Default' : 'User Provided'}
        - Detected: ${decoded_message}
        - Watermarked Message ID: ${watermarkedMessage._id}`);

    } catch (error) {
      console.error("❌ Error calling Python API:", error.response?.data || error.message);
      
      let errorMessage = error.response?.data?.detail || error.message;
      if (error.message.includes('timeout')) {
        errorMessage = "Processing timeout - file may be too large or server overloaded";
      }
      
      audioFile.processingStatus = "failed";
      audioFile.errorMessage = errorMessage;
      await audioFile.save();
      
      throw { status: 500, message: "Watermarking failed: " + errorMessage };
    }

    await audioFile.populate('uploadedBy', 'name email');
    return audioFileDTO(audioFile);
    
  } catch (error) {
    console.error("Error in createAudioFileService:", error.message);
    throw error;
  }
};

/**
 * Detect an audio file
 * @param {string} audioFile - Audio file data
 * @param {string} userId - User ID
 * @returns {Object} Detect audio file response
 */
export const detectWatermarkService = async (audioFile, userId) => {
  let uploadedAudioUrl;

  try {
    const {
      format,
      fileBuffer,
      filePath,
      fileBase64
    } = audioFile;

    if (!format) {
      throw { status: 400, message: "File format is required!" };
    }

    if (!userId) {
      throw { status: 400, message: "User ID is required!" };
    }

    if (!fileBuffer && !filePath && !fileBase64) {
      throw {
        status: 400,
        message: "Audio file data is required! Provide fileBuffer, filePath, or fileBase64"
      };
    }

    const allowedFormats = ['mp3', 'wav', 'flac', 'mp4', 'm4a'];
    if (!allowedFormats.includes(format.toLowerCase())) {
      throw {
        status: 400,
        message: `Unsupported format. Allowed formats: ${allowedFormats.join(', ')}`
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found!" };
    }

    // === Prepare audio for Cloudinary ===
    let audioDataToUpload;
    if (fileBuffer) {
      audioDataToUpload = `data:audio/${format};base64,${fileBuffer.toString('base64')}`;
    } else if (fileBase64) {
      audioDataToUpload = fileBase64.startsWith('data:')
        ? fileBase64
        : `data:audio/${format};base64,${fileBase64}`;
    } else {
      audioDataToUpload = filePath;
    }

    const cloudinaryUploadUrl = await uploadAudioToCloudinary(audioDataToUpload, format, {
      resource_type: "video",
      folder: "detect_audio_files",
      fetch_format: "wav"
    });

    // === Call Python API ===
    const response = await axios.post(
      `${PYTHON_API_BASE_URL}/detect-watermark`,
      { audioUrl: cloudinaryUploadUrl },
      {
        timeout: PYTHON_API_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const {
      status,
      watermark_detected,
      decoded_message,
      confidence = 0.0
    } = response.data;

    if (status !== "done" || typeof watermark_detected === "undefined") {
      throw {
        status: 500,
        message: "Watermark detection failed on Python backend"
      };
    }

    let watermarkObj = null;
    let isOwner = false;
    let ownerInfo = null;

    if (watermark_detected && decoded_message) {
      try {
        watermarkObj = await WatermarkedMessage.findOne({ _id: decoded_message })
          .select('message createdAt detectionCount -_id')
          .populate({
            path: 'createdBy',
            select: 'name _id'
          });

        if (watermarkObj) {
          // Check if current user is the owner
          isOwner = watermarkObj.createdBy._id.toString() === userId;
          
          // Store owner info for response
          ownerInfo = {
            id: watermarkObj.createdBy._id,
            name: watermarkObj.createdBy.name
          };

          // Increment detection count
          await WatermarkedMessage.findOneAndUpdate(
            { _id: decoded_message },
            { 
              $inc: { detectionCount: 1 },
              lastDetectedAt: new Date(),
              $addToSet: { 
                detectedBy: {
                  userId: userId,
                  detectedAt: new Date(),
                  isOwner: isOwner
                }
              }
            }
          );
        }
      } catch (dbError) {
        console.error("❌ Failed to fetch WatermarkedMessage:", dbError.message);
      }
    }
    if (confidence && confidence < 0.5) {
      return {
        detected: false,
        message: "Detection failed due to low confidence!",
        confidence
      }
    }
    
    // Prepare response based on ownership
    let responseData = {
      detected: watermark_detected,
      confidence,
      audioUrl: uploadedAudioUrl,
      isOwner: isOwner
    };

    if (watermark_detected && watermarkObj) {
      if (isOwner) {
        // Owner gets full access to their watermarked message
        responseData = {
          ...responseData,
          message: {
            content: watermarkObj.message,
            createdAt: watermarkObj.createdAt,
            detectionCount: (watermarkObj.detectionCount || 0) + 1
          },
          owner: ownerInfo
        };
      } else {
        // Non-owner only gets owner information and detection count
        responseData = {
          ...responseData,
          message: {
            content: "This audio file contains a watermark.",
            detectionCount: (watermarkObj.detectionCount || 0) + 1
          },
          owner: ownerInfo,
          note: `This watermarked audio belongs to ${ownerInfo.name}`
        };
      }
    } else if (watermark_detected && decoded_message) {
      // Fallback if watermarkObj not found but watermark detected
      responseData = {
        ...responseData,
        message: decoded_message
      };
    } else {
      responseData = {
        ...responseData,
        message: null
      };
    }
    return responseData;

  } catch (error) {
    try {
      if (audioFile?.filePath) {
        await AudioFile.findOneAndUpdate(
          { filePath: audioFile.filePath },
          {
            processingStatus: "detection_failed",
            detectionTimestamp: new Date()
          }
        );
      }
    } catch (updateError) {
      console.error("❌ Failed to update detection_failed status:", updateError);
    }

    const status = error.response?.status;

    if (status === 400) {
      throw { status: 400, message: error.response?.data?.detail || "Bad request to detection API" };
    } else if (status === 404) {
      throw { status: 404, message: "Audio file not accessible or not found" };
    } else if (status >= 500) {
      throw { status: 500, message: "Python API server error during detection" };
    } else if (error.code === 'ECONNREFUSED') {
      throw { status: 503, message: "Python server is not running" };
    } else if (error.code === 'ETIMEDOUT') {
      throw { status: 408, message: "Detection request timed out" };
    }
    console.error("❌ Unhandled Error in detectWatermarkService:", error.message);
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
        if (audioFile.processingStatus !== 'completed') {
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
        resource_type: "video",
        folder: "audio_files",
        quality: "100",
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

const generate16BitBinaryString = async () => {
    try {
    let bits = '';
    for (let i = 0; i < 16; i++) {
        bits += Math.round(Math.random()); // Append either 0 or 1
    }
    return bits;
    } catch (error) {
        console.error("Error generate16BitBinaryString:", error);
        throw { status: 400, message: "Failed to generate16BitBinaryString" };
    }

}