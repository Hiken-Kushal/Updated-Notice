import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';

// Ensure base upload directories exist
const uploadDirs = [
  path.resolve(env.UPLOAD_DIR),
  path.resolve(env.UPLOAD_DIR, 'notices'),
  path.resolve(env.UPLOAD_DIR, 'banners'),
  path.resolve(env.UPLOAD_DIR, 'documents'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure disk storage
const createStorage = (subfolder: 'notices' | 'banners' | 'documents') => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.resolve(env.UPLOAD_DIR, subfolder);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
};

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

export const uploadNoticeAttachments = multer({
  storage: createStorage('notices'),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedAttachmentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, Word, Excel, Images.`));
    }
  },
});

export const uploadBannerImage = multer({
  storage: createStorage('banners'),
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
  storage: createStorage('documents'),
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
