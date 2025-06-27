import mongoose from "mongoose";

const downloadLogSchema = new mongoose.Schema({
    audioFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AudioFile',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloadType: {
        type: String,
        enum: ['single', 'bulk'],
        default: 'single'
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);

export default DownloadLog;