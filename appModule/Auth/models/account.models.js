import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required!"],
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required!"],
      min: [6, "Password must be at least 6 character long!"],
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken: String,
    resetPasswordExpireAt: Date,
    verificationToken: String,
    verificationTokenExpireAt: Date,
    
    userType: {
      type: String,
      enum: ["USER", "MANAGER", "ADMIN"], // Restricts values to these options
      default: "USER",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    discriminatorKey: "userType", // Field used to differentiate between inherited models
  }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
  