import multer from 'multer';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Configure storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text
    'text/plain',
    'text/csv',
    'text/markdown',
    // Code
    'application/json',
    'text/javascript',
    'text/typescript',
    'text/html',
    'text/css'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter
});

// Generate unique filename
export const generateFileName = (originalname: string): string => {
  const extension = originalname.split('.').pop();
  return `${uuidv4()}.${extension}`;
};

// Export middleware functions
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 5); 