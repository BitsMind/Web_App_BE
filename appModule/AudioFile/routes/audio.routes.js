import express from "express";
import {
    // getAllAudioFilesUser,
    createAudioFile,
    deleteAudioFile,
    detectWatermark,
    downloadAudioFile,
    // getAudioFilesByFormat,
    editAudioFile,
    // getAudioFileDetail,
    // toggleProcessingStatus,
    // updateMultipleProcessingStatus,
    getAllAudioFiles,
    getUserAudioFiles,
    // updateWatermarkStatus
} from "../controllers/audio.controller.js";
import { protectRoute } from "../../utils/middleware/protectRoute.js";
import { ROLE_GROUPS } from "../../utils/middleware/role.js";

const router = express.Router();

// Admin routes - Get all audio files with admin access
router.get("/audio-admin", protectRoute(ROLE_GROUPS.STAFF), getAllAudioFiles);

// Public/User routes
// router.get("/", getAllAudioFilesUser); // Get all public audio files
router.get("/my-files", protectRoute(ROLE_GROUPS.USER), getUserAudioFiles); // Get current user's audio files
router.get('/download/:id', protectRoute(ROLE_GROUPS.USER), downloadAudioFile);

// router.get("/:id", getAudioFileDetail); // Get specific audio file details
// router.get("/format/:format", getAudioFilesByFormat); // Get audio files by format (mp3, wav, etc.)

// Create/Upload routes
router.post("/upload", protectRoute(ROLE_GROUPS.USER), createAudioFile); // Upload new audio file

// Edit routes
router.put("/edit/:id", protectRoute(ROLE_GROUPS.STAFF), editAudioFile); // Edit audio file metadata

// Status management routes
// router.patch("/processing-status/:id", protectRoute(ROLE_GROUPS.STAFF), toggleProcessingStatus); // Toggle processing status
// router.patch("/watermark-status/:id", protectRoute(ROLE_GROUPS.USER), updateWatermarkStatus); // Update watermark status
// router.patch("/bulk-processing-status", protectRoute(ROLE_GROUPS.STAFF), updateMultipleProcessingStatus); // Bulk update processing status

// Delete routes
router.delete("/delete/:id", protectRoute(ROLE_GROUPS.USER), deleteAudioFile); // Delete audio file

router.post("/detect-watermark", protectRoute(ROLE_GROUPS.USER), detectWatermark);

export default router;