import mongoose from "mongoose";

const audioFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, "File name is required"],
    trim: true,
    maxlength: [255, "File name cannot exceed 255 characters"],
  },
  filePath: {
    type: String,
    required: [true, "File path is required"],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v); // Ensure it's a valid URL
      },
      message: 'File path must be a valid URL'
    }
  },
  fileSize: {
    type: Number,
    required: true,
    min: [0, "File size cannot be negative"],
    max: [1073741824, "File size cannot exceed 1GB"],
  },
  format: {
    type: String,
    default: 'mp3',
    required: true,
    lowercase: true,
    enum: {
      values: ['mp3', 'wav', 'flac', 'mp4', 'm4a'],
      message: 'Format must be one of: mp3, wav, flac, mp4, m4a'
    },
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  watermarkMessage: {
    type: String,
    default: null
  },
  watermarkedMessageId: {
    type: String,
    ref: "WatermarkedMessage",
    default: null
  },
  processingStatus: {
    type: String,
    enum: {
      values: ["pending", "processing", "detecting", "completed", "failed"],
      message: 'Status must be one of: pending, processing, detecting, completed, failed'
    },
    default: "pending",
    index: true,
  },
  
  // === 🆕 ENHANCED COMPARISON PLOT FIELDS ===
  comparisonPlot: {
    type: String, // Base64 encoded - kept as backup
    default: null,
    select: false // Don't include in regular queries to reduce payload
  },
  comparisonPlotUrl: {
    type: String, // Primary Cloudinary URL
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Comparison plot URL must be valid'
    }
  },
  plotCloudinaryId: {
    type: String, // Cloudinary public_id for management
    default: null
  },
  plotMetadata: {
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    format: { type: String, default: null },
    bytes: { type: Number, default: null },
    thumbnailUrl: { type: String, default: null }, // Optimized thumbnail
    version: { type: String, default: null } // Cloudinary version
  },
  plotGeneratedAt: {
    type: Date,
    default: null,
    index: true
  },
  plotGenerationError: {
    type: String,
    default: null
  },
  plotAccessCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // === 🆕 ENHANCED AUDIO INFO FIELDS ===
  audioInfo: {
    originalSampleRate: {
      type: Number,
      default: null,
      min: 8000,
      max: 192000
    },
    processedSampleRate: {
      type: Number,
      default: null,
      min: 8000,
      max: 192000
    },
    watermarkConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1
    },
    channels: {
      type: Number,
      default: null,
      min: 1,
      max: 8
    },
    samples: {
      type: Number,
      default: null,
      min: 0
    }
  },

  // === Watermark Detection Fields ===
  watermarkDetected: {
    type: Boolean,
    default: null,
    index: true
  },
  confidence: {
    type: Number,
    default: null,
    min: 0,
    max: 1
  },
  detectedMessage: {
    type: String,
    default: null,
    maxlength: 1000
  },
  detectionTimestamp: {
    type: Date,
    default: null,
    index: true
  },
  detectionAttempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 10 // Prevent infinite retry loops
  },
  lastDetectionError: {
    type: String,
    default: null
  },
  isWatermarked: {
    type: Boolean,
    default: false,
    index: true,
  },

  // === Enhanced Metadata ===
  metadata: {
    duration: {
      type: Number,
      default: null,
      min: 0,
      max: 7200 // 2 hours max
    },
    bitrate: {
      type: Number,
      default: null,
      min: 8,
      max: 2000
    },
    sampleRate: {
      type: Number,
      default: null,
      min: 8000,
      max: 192000
    },
    channels: {
      type: Number,
      default: null,
      min: 1,
      max: 8
    },
    // Audio quality indicators
    peakLevel: { type: Number, default: null },
    rmsLevel: { type: Number, default: null },
    dynamicRange: { type: Number, default: null }
  },

  // === Processing Metrics ===
  processingMetrics: {
    uploadDuration: { type: Number, default: null }, // ms
    watermarkingDuration: { type: Number, default: null }, // ms
    plotGenerationDuration: { type: Number, default: null }, // ms
    totalProcessingTime: { type: Number, default: null }, // ms
    memoryUsage: { type: Number, default: null }, // bytes
    cpuUsage: { type: Number, default: null } // percentage
  },

  // === Tags and Categories ===
  processedAt: {
    type: Date,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, "Tag cannot exceed 50 characters"],
  }],
  category: {
    type: String,
    enum: ['music', 'speech', 'podcast', 'soundeffect', 'other'],
    default: 'other',
    index: true
  },

  // === Privacy and Sharing ===
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // === System Fields ===
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 },
  },
  
  // === Analytics ===
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastAccessedAt: {
    type: Date,
    default: null
  },
  
  // === Error Handling ===
  errorMessage: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  }
}, { 
  timestamps: true,
  versionKey: false,
  read: 'secondaryPreferred',
  // Optimize for performance
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Don't include base64 plot data in JSON responses by default
      delete ret.comparisonPlot;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound indexes for common query patterns
audioFileSchema.index({ uploadedBy: 1, createdAt: -1 }); // User files by date
audioFileSchema.index({ processingStatus: 1, createdAt: 1 }); // Processing queue
audioFileSchema.index({ isActive: 1, uploadedBy: 1 }); // Active user files
audioFileSchema.index({ format: 1, isWatermarked: 1 }); // Format and watermark filtering
audioFileSchema.index({ detectionTimestamp: -1 });
audioFileSchema.index({ 'uploadedBy': 1, 'watermarkDetected': 1 });
audioFileSchema.index({ tags: 1 }); // Tag-based searches
audioFileSchema.index({ fileSize: 1 }); // Size-based queries
audioFileSchema.index({ plotGeneratedAt: -1 }); // 🆕 Plot generation tracking

// Text index for search functionality
audioFileSchema.index({
  fileName: 'text',
  'metadata.title': 'text',
  'metadata.artist': 'text',
  'metadata.album': 'text',
  tags: 'text'
}, {
  name: 'audio_search_index',
  weights: {
    fileName: 10,
    'metadata.title': 8,
    'metadata.artist': 6,
    'metadata.album': 4,
    tags: 2
  }
});

// Virtual for human-readable file size
audioFileSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for duration formatting
audioFileSchema.virtual('durationFormatted').get(function() {
  if (!this.metadata?.duration) return null;
  const minutes = Math.floor(this.metadata.duration / 60);
  const seconds = Math.floor(this.metadata.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 🆕 Virtual for plot availability
audioFileSchema.virtual('hasComparisonPlot').get(function() {
  return !!(this.comparisonPlot || this.comparisonPlotUrl);
});

// Pre-save middleware for validation and processing
audioFileSchema.pre('save', function(next) {
  // Auto-set processedAt when status changes to 'completed' or 'failed'
  if (this.isModified('processingStatus') && 
      ['completed', 'failed'].includes(this.processingStatus)) {
    this.processedAt = new Date();
  }
  
  // Auto-set plotGeneratedAt when comparison plot is added
  if (this.isModified('comparisonPlot') && this.comparisonPlot) {
    this.plotGeneratedAt = new Date();
  }
  
  // Validate watermark message when watermarked
  if (this.isWatermarked && !this.watermarkMessage) {
    return next(new Error('Watermark message is required when file is watermarked'));
  }
  
  next();
});

// Static methods for common queries
audioFileSchema.statics.findByUser = function(userId, options = {}) {
  const query = { uploadedBy: userId, isActive: true };
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50)
    .populate(options.populate || '');
};

audioFileSchema.statics.findPendingProcessing = function(limit = 10) {
  return this.find({ 
    processingStatus: 'pending',
    isActive: true 
  })
  .sort({ createdAt: 1 })
  .limit(limit);
};

// 🆕 Find files with comparison plots
audioFileSchema.statics.findWithPlots = function(userId = null, options = {}) {
  const query = {
    $or: [
      { comparisonPlot: { $exists: true, $ne: null } },
      { comparisonPlotUrl: { $exists: true, $ne: null } }
    ],
    isActive: true
  };
  
  if (userId) {
    query.uploadedBy = userId;
  }
  
  return this.find(query)
    .sort(options.sort || { plotGeneratedAt: -1 })
    .limit(options.limit || 20);
};

audioFileSchema.statics.searchFiles = function(searchTerm, userId = null, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  if (userId) {
    query.uploadedBy = userId;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

// Instance methods
audioFileSchema.methods.markAsProcessed = function() {
  this.processingStatus = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// 🆕 Method to save comparison plot
audioFileSchema.methods.saveComparisonPlot = function(plotBase64, plotUrl = null) {
  this.comparisonPlot = plotBase64;
  if (plotUrl) {
    this.comparisonPlotUrl = plotUrl;
  }
  this.plotGeneratedAt = new Date();
  this.plotGenerationError = null;
  return this.save();
};

// 🆕 Method to save audio info
audioFileSchema.methods.saveAudioInfo = function(audioInfo) {
  this.audioInfo = {
    originalSampleRate: audioInfo.original_sample_rate,
    processedSampleRate: audioInfo.processed_sample_rate,
    watermarkConfidence: audioInfo.watermark_confidence,
    channels: audioInfo.channels,
    samples: audioInfo.samples
  };
  
  // Also update metadata duration if provided
  if (audioInfo.duration_seconds) {
    this.metadata = this.metadata || {};
    this.metadata.duration = audioInfo.duration_seconds;
  }
  
  return this.save();
};

audioFileSchema.methods.incrementDownloadCount = function() {
  return this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
};

// Ensure indexes are created
audioFileSchema.set('autoIndex', process.env.NODE_ENV !== 'production');

const AudioFile = mongoose.model("AudioFile", audioFileSchema);

export default AudioFile;