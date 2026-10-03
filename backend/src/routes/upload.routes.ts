import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
  uploadNoticeAttachments,
  uploadBannerImage,
  uploadDocumentFile,
} from '../middlewares/upload.middleware';

const router = Router();

// Notice file attachments (multiple)
router.post(
  '/attachments',
  authenticate,
  requireRole(['ADMIN']),
  uploadNoticeAttachments.array('files', 10),
  UploadController.uploadNoticeAttachments
);

// Single banner graphic
router.post(
  '/banner-image',
  authenticate,
  requireRole(['ADMIN']),
  uploadBannerImage.single('image'),
  UploadController.uploadBannerImage
);

// Single college document
router.post(
  '/document',
  authenticate,
  requireRole(['ADMIN']),
  uploadDocumentFile.single('file'),
  UploadController.uploadDocument
);

export default router;
