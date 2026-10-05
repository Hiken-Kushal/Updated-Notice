import multer from 'multer';
import { env } from '../config/env';

// Allowed MIME types
const allowedAttachmentMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

// In-memory storage: file buffers are held in memory (req.file.buffer / req.files[i].buffer)
// for direct upload to Supabase Storage without writing to the local filesystem.
const memoryStorage = multer.memoryStorage();

export const uploadNoticeAttachments = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedAttachmentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, Word, Excel, CSV, Images.`));
    }
  },
});

export const uploadBannerImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for banner graphics
  },
  fileFilter: (_req, file, cb) => {
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, SVG.`));
    }
  },
});

export const uploadDocumentFile = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedAttachmentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, Word, Excel.`));
    }
  },
});
