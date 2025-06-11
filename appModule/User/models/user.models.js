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
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema);

export default User;