import mongoose from "mongoose";

const audioFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, "File name is required"],
  },
  filePath: {
    type: String,
    required: [true, "File path is required"], // Could be local path or cloud URL
  },
  fileSize: {
    type: Number, // In bytes
    required: true,
  },
  format: {
    type: String,
    enum: ["mp3", "wav", "flac"],
    required: true,
  },
  isWatermarked: {
    type: Boolean,
    default: false,
  },
  watermarkMessage: {
    type: String,
    default: null,
  },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending",
  },
  processedAt: {
    type: Date,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const AudioFile = mongoose.model("AudioFile", audioFileSchema);

export default AudioFile;
