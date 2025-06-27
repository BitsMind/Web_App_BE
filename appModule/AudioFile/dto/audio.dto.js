/**
 * Data Transfer Object for Audio File (Admin/Full access)
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Formatted audio file data for admin/full access
 */
export const audioFileDTO = (audioFile) => {
    if (!audioFile) return null;

    return {
        id: audioFile._id,
        fileName: audioFile.fileName,
        filePath: audioFile.filePath,
        fileSize: audioFile.fileSize,
        format: audioFile.format,
        isWatermarked: audioFile.isWatermarked,
        watermarkMessage: audioFile.watermarkMessage,
        processingStatus: audioFile.processingStatus,
        processedAt: audioFile.processedAt,
        uploadedBy: audioFile.uploadedBy ? {
            id: audioFile.uploadedBy._id || audioFile.uploadedBy,
            name: audioFile.uploadedBy.name,
            email: audioFile.uploadedBy.email
        } : null,
        createdAt: audioFile.createdAt,
        updatedAt: audioFile.updatedAt
    };
};

/**
 * Data Transfer Object for Audio File (User interface)
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Formatted audio file data for user interface
 */
export const audioFileUserDTO = (audioFile) => {
    if (!audioFile) return null;

    return {
        id: audioFile._id,
        fileName: audioFile.fileName,
        filePath: audioFile.filePath,
        fileSize: audioFile.fileSize,
        format: audioFile.format,
        isWatermarked: audioFile.isWatermarked,
        processingStatus: audioFile.processingStatus,
        processedAt: audioFile.processedAt,
        uploadedBy: audioFile.uploadedBy ? {
            id: audioFile.uploadedBy._id || audioFile.uploadedBy,
            name: audioFile.uploadedBy.name
        } : null,
        createdAt: audioFile.createdAt
    };
};

/**
 * Data Transfer Object for Audio File (Public/Limited access)
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Formatted audio file data for public access
 */
export const audioFilePublicDTO = (audioFile) => {
    if (!audioFile) return null;

    return {
        id: audioFile._id,
        fileName: audioFile.fileName,
        filePath: audioFile.filePath,
        fileSize: audioFile.fileSize,
        format: audioFile.format,
        isWatermarked: audioFile.isWatermarked,
        processingStatus: audioFile.processingStatus,
        uploadedBy: audioFile.uploadedBy ? {
            name: audioFile.uploadedBy.name
        } : null,
        createdAt: audioFile.createdAt
    };
};

/**
 * Data Transfer Object for Audio File (Minimal data for lists)
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Minimal audio file data for lists/cards
 */
export const audioFileMinimalDTO = (audioFile) => {
    if (!audioFile) return null;

    return {
        id: audioFile._id,
        fileName: audioFile.fileName,
        fileSize: audioFile.fileSize,
        format: audioFile.format,
        isWatermarked: audioFile.isWatermarked,
        processingStatus: audioFile.processingStatus,
        createdAt: audioFile.createdAt
    };
};

/**
 * Data Transfer Object for Audio File Processing Status
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Audio file processing status data
 */
export const audioFileStatusDTO = (audioFile) => {
    if (!audioFile) return null;

    return {
        id: audioFile._id,
        fileName: audioFile.fileName,
        processingStatus: audioFile.processingStatus,
        processedAt: audioFile.processedAt,
        isWatermarked: audioFile.isWatermarked,
        watermarkMessage: audioFile.watermarkMessage,
        updatedAt: audioFile.updatedAt
    };
};

/**
 * Helper function to format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Enhanced Audio File User DTO with formatted file size
 * @param {Object} audioFile - Audio file object from database
 * @returns {Object} Enhanced audio file data for user interface
 */
export const audioFileUserEnhancedDTO = (audioFile) => {
    if (!audioFile) return null;

    const baseDTO = audioFileUserDTO(audioFile);
    
    return {
        ...baseDTO,
        fileSizeFormatted: formatFileSize(audioFile.fileSize),
        isProcessing: audioFile.processingStatus === 'processing',
        isReady: audioFile.processingStatus === 'done',
        hasFailed: audioFile.processingStatus === 'failed'
    };
};
