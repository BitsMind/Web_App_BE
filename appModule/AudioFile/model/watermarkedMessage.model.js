import mongoose from "mongoose";

const watermarkedMessageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true // generate 16-char unique ID
  },

  audioFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AudioFile",
    required: [true, "Audio file reference is required"],
    index: true,
  },
  message: {
    type: String,
    required: [true, "Watermark message is required"],
    maxlength: [500, "Watermark message cannot exceed 500 characters"],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  approvedAt: {
    type: Date,
    default: null,
  },

  detectionCount: {
    type: Number,
    default: 0
  },

}, {
  timestamps: true,
  versionKey: false
});

// Index for quick lookup
watermarkedMessageSchema.index({ audioFile: 1, createdAt: -1 });

const WatermarkedMessage = mongoose.model("WatermarkedMessage", watermarkedMessageSchema);

export default WatermarkedMessage;
