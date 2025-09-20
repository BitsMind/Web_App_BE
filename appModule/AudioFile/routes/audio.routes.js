import express from "express";
import {
    createAudioFile,
    deleteAudioFile,
    detectWatermark,
    downloadAudioFile,
    editAudioFile,
    getAllAudioFiles,
    getUserAudioFiles,
} from "../controllers/audio.controller.js";
import { protectRoute } from "../../utils/middleware/protectRoute.js";
import { ROLE_GROUPS } from "../../utils/middleware/role.js";

const router = express.Router();

router.get("/audio-admin", protectRoute(ROLE_GROUPS.STAFF), getAllAudioFiles);
router.get("/my-files", protectRoute(ROLE_GROUPS.USER), getUserAudioFiles); 
router.get('/download/:id', protectRoute(ROLE_GROUPS.USER), downloadAudioFile);
router.post("/upload", protectRoute(ROLE_GROUPS.USER), createAudioFile); 
router.put("/edit/:id", protectRoute(ROLE_GROUPS.STAFF), editAudioFile); 
router.delete("/delete/:id", protectRoute(ROLE_GROUPS.USER), deleteAudioFile); 
router.post("/detect-watermark", protectRoute(ROLE_GROUPS.USER), detectWatermark);

export default router;