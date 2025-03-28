import express from 'express';
import { auth } from '../middleware/auth';
import { uploadSingle } from '../middleware/fileUpload';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  getUploadUrl,
  getDownloadUrl
} from '../controllers/file';

const router = express.Router();

// Protect all routes
router.use(auth);

// File upload routes
router.post('/upload', uploadSingle, uploadFile);
router.post('/upload-url', getUploadUrl);

// File download routes
router.get('/:key', downloadFile);
router.get('/download-url/:key', getDownloadUrl);

// File deletion route
router.delete('/:key', deleteFile);

export default router; 