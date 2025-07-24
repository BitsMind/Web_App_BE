import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Name is require!"],
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        lowercase: true,
        trim: true,
        unique: true,
      },
    avatar: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                // Allow null/undefined or valid URL format
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: "Avatar must be a valid URL"
        }
    },

    audioFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AudioFile",
      },
    ],

    totalProcessedFiles: {
      type: Number,
      default: 0,
    },
    
    totalPaid: {
        type: Number,
        default: 0,
    },

    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
    },

    usedStorage: {
      type: Number,
      default:0,
    }
}, {timestamps: true})
// Index for better query performance
userSchema.index({ accountId: 1 });

const User = mongoose.model("User", userSchema);

export default User;