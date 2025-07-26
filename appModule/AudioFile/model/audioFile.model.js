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
    required: [true, "File path is required"], // Could be local path or cloud URL
    trim: true,
  },
  fileSize: {
    type: Number, // In bytes
    required: true,
    min: [0, "File size cannot be negative"],
    max: [1073741824, "File size cannot exceed 1GB"], // 1GB limit
  },
  format: {
    type: String,
    default: 'mp3',
    required: true,
    lowercase: true,
    enum: {
      values: ['mp3', 'wav', 'flac', 'mp4', 'm4a'],
      message: 'Format must be one of: mp3, wav, flac, aac, m4a, ogg, wma'
    },
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for user-specific queries
  },
  watermarkMessage: {
    type: String,
    // ref: "WatermarkedMessage",
    default: null
  },
  watermarkedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WatermarkedMessage",
    default: null
  },
  processingStatus: {
    type: String,
    enum: {
      values: ["pending", "processing", "detecting", "completed", "failed"],
      message: 'Status must be one of: pending, processing, completed, failed'
    },
    default: "pending",
    index: true, // Index for querying by status
  },
  // === Watermark Detection Fields ===
  watermarkDetected: {
        type: Boolean,
        default: null // null = not tested, true = detected, false = not detected
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
        default: null
    },
    detectionAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    lastDetectionError: {
        type: String,
        default: null
    },

      isWatermarked: {
    type: Boolean,
    default: false,
    index: true, // Index for filtering watermarked files
  },

    // === Metadata ===
    metadata: {
        duration: {
            type: Number, // in seconds
            default: null
        },
        bitrate: {
            type: Number,
            default: null
        },
        sampleRate: {
            type: Number,
            default: null
        },
        channels: {
            type: Number,
            default: null
        }
    },

    // === Tags and Categories ===

  processedAt: {
    type: Date,
    index: true, // Index for sorting by processing time
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
        default: 'other'
    },

    // === Privacy Settings ===
    isPublic: {
        type: Boolean,
        default: false
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

  isActive: {
    type: Boolean,
    default: true,
    index: true, // Index for filtering active/inactive files
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }, // TTL index for automatic deletion
  },
}, { 
  timestamps: true,
  versionKey: false,
  // Optimize for read operations
  read: 'secondaryPreferred',
});

// Compound indexes for common query patterns
audioFileSchema.index({ uploadedBy: 1, createdAt: -1 }); // User files by date
audioFileSchema.index({ processingStatus: 1, createdAt: 1 }); // Processing queue
audioFileSchema.index({ watermarkDetected: 1 });
audioFileSchema.index({ isActive: 1, uploadedBy: 1 }); // Active user files
audioFileSchema.index({ format: 1, isWatermarked: 1 }); // Format and watermark filtering
audioFileSchema.index({ detectionTimestamp: -1 });
audioFileSchema.index({ 'uploadedBy': 1, 'watermarkDetected': 1 });
audioFileSchema.index({ tags: 1 }); // Tag-based searches
audioFileSchema.index({ fileSize: 1 }); // Size-based queries
audioFileSchema.index({ duration: 1 }); // Duration-based queries

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
  if (!this.duration) return null;
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Pre-save middleware for validation and processing
audioFileSchema.pre('save', function(next) {
  // Auto-set processedAt when status changes to 'done' or 'failed'
  if (this.isModified('processingStatus') && 
      ['done', 'failed'].includes(this.processingStatus)) {
    this.processedAt = new Date();
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
  this.processingStatus = 'done';
  this.processedAt = new Date();
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