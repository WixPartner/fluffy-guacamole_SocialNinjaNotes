import { Request, Response } from 'express';
import { generateFileName } from '../middleware/fileUpload';
import FileStorageService from '../services/FileStorage';
import { logger } from '../utils/logger';

// Initialize FileStorage service lazily
let fileStorage: FileStorageService;

const getFileStorage = () => {
  if (!fileStorage) {
    fileStorage = new FileStorageService();
  }
  return fileStorage;
};

// @desc    Upload file
// @route   POST /api/files/upload
export const uploadFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    logger.info(`Processing file upload: ${req.file.originalname}`);
    logger.info(`File details:`, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: req.body.folder || 'temp'
    });

    const fileName = generateFileName(req.file.originalname);
    // Use the correct folder structure
    const baseFolder = 'private';
    const subFolder = req.body.folder || 'documents';
    const folder = `${baseFolder}/${subFolder}`;

    logger.info(`Generated filename: ${fileName}, folder path: ${folder}`);

    const fileMetadata = await getFileStorage().uploadFile({
      file: req.file.buffer,
      fileName,
      mimeType: req.file.mimetype,
      folder
    });

    logger.info(`File upload successful. Response metadata:`, fileMetadata);
    return res.status(201).json(fileMetadata);
  } catch (error) {
    logger.error('Error in uploadFile:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
};

// @desc    Download file
// @route   GET /api/files/:key
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const fileStream = await getFileStorage().downloadFile(key);
    const metadata = await getFileStorage().getFileMetadata(key);

    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${key.split('/').pop()}`);
    
    fileStream.pipe(res);
  } catch (error) {
    logger.error('Error in downloadFile:', error);
    res.status(500).json({ message: 'Error downloading file' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:key
export const deleteFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { key } = req.params;
    await getFileStorage().deleteFile(key);
    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteFile:', error);
    return res.status(500).json({ message: 'Error deleting file' });
  }
};

// @desc    Get upload URL
// @route   POST /api/files/upload-url
export const getUploadUrl = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { fileName, contentType } = req.body;
    const folder = req.body.folder || 'temp';
    const key = `${folder}/${generateFileName(fileName)}`;
    
    const url = await getFileStorage().generatePresignedUploadUrl(key, contentType);
    return res.status(200).json({ url, key });
  } catch (error) {
    logger.error('Error in getUploadUrl:', error);
    return res.status(500).json({ message: 'Error generating upload URL' });
  }
};

// @desc    Get download URL
// @route   GET /api/files/download-url/:key
export const getDownloadUrl = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { key } = req.params;
    const url = await getFileStorage().generatePresignedDownloadUrl(key);
    return res.status(200).json({ url });
  } catch (error) {
    logger.error('Error in getDownloadUrl:', error);
    return res.status(500).json({ message: 'Error generating download URL' });
  }
}; 