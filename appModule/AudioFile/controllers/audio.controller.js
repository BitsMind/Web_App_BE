import { 
    createAudioFileService, 
    deleteAudioFileService, 
    editAudioFileService, 
    generateDownloadUrlService, 
    getAllAudioFileService, 
    getAllAudioFileUserService, 
    getAudioFileByIdService,
    updateProcessingStatusService
} from "../service/audio.service.js";

export const getAllAudioFiles = async(req, res) => {
    try {
        const all = req.query.all === 'true'; // get all=true from query
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const includeFailed = req.query.includeFailed === 'true'

        res.status(200).json(await getAllAudioFileService(page, limit, all, includeFailed));
    } catch (error) {
        console.error("Error in getAllAudioFiles controller: ", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
}

export const getAllAudioFilesUser = async(req, res) => {
    try {
        const userId = req.user?.id || null; // Get user ID from authenticated user
        res.status(200).json(await getAllAudioFileUserService(userId));
    } catch (error) {
        console.error("Error in getAllAudioFilesUser controller: ", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
}

export const createAudioFile = async (req, res) => {
    try {
        const { newAudioFile } = req.body;
        const userId = req.user.id; // Assuming user is authenticated
        
        if (!userId) {
            return res.status(401).json({ error: "Authentication required!" });
        }

        res.status(201).json(await createAudioFileService(newAudioFile, userId));
    } catch (error) {
        console.error("Error in createAudioFile controller: ", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const editAudioFile = async(req, res) => {
    try {
        const {id: audioFileId} = req.params;
        const { updateData } = req.body;
        const userId = req.user.id; // Assuming user is authenticated
        
        if (!userId) {
            return res.status(401).json({ error: "Authentication required!" });
        }

        res.status(200).json(await editAudioFileService(audioFileId, updateData, userId));
    } catch (error) {
        console.error("Error in editAudioFile controller: ", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
}

export const deleteAudioFile = async (req, res) => {
    try {
        const { id: audioFileId } = req.params;
        const userId = req.user.id; // Assuming user is authenticated
        
        if (!userId) {
            return res.status(401).json({ error: "Authentication required!" });
        }

        res.status(200).json(await deleteAudioFileService(audioFileId, userId));
    } catch (error) {
        console.error("Error in deleteAudioFile controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const getAudioFileById = async (req, res) => {
    try {
        const { id: audioFileId } = req.params;
        const userId = req.user?.id || null; // Optional authentication
        
        res.status(200).json(await getAudioFileByIdService(audioFileId, userId));
    } catch (error) {
        console.error("Error in getAudioFileById controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const updateProcessingStatus = async (req, res) => {
    try {
        const { id: audioFileId } = req.params;
        const { status, watermarkMessage } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: "Processing status is required!" });
        }

        res.status(200).json(await updateProcessingStatusService(audioFileId, status, watermarkMessage));
    } catch (error) {
        console.error("Error in updateProcessingStatus controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const getUserAudioFiles = async (req, res) => {
    try {
        const userId = req.user.id; // Get authenticated user's ID
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const all = req.query.all === 'true';
        
        if (!userId) {
            return res.status(401).json({ error: "Authentication required!" });
        }

        // Filter by user ID in the service call
        res.status(200).json(await getAllAudioFileUserService(userId));
    } catch (error) {
        console.error("Error in getUserAudioFiles controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const getAudioFilesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const userId = req.user?.id;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        
        const validStatuses = ['pending', 'processing', 'done', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status parameter!" });
        }

        // You can modify the service to filter by status
        const filter = { processingStatus: status };
        if (userId) {
            filter.uploadedBy = userId;
        }

        res.status(200).json(await getAllAudioFileService(page, limit, false, status === 'failed', filter));
    } catch (error) {
        console.error("Error in getAudioFilesByStatus controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const downloadAudioFile = async (req, res) => {
    try {
        const { id: audioFileId } = req.params;
        const userId = req.user?.id || null; // Optional if you allow guests to download

        const result = await generateDownloadUrlService(audioFileId, userId);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in downloadAudioFile controller:", error.message);
        res.status(error.status || 500).json({ error: error.message || "Failed to generate download URL" });
    }
};