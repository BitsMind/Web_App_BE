import mongoose from "mongoose";

const userActivitySchema  = new mongoose.Schema({
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    activity: { type: String, required: true },
    metadata: { type: Object },
}, {timestamps: true})

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;