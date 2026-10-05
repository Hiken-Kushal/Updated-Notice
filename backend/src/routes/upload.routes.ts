import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth.middleware';
import {
  uploadNoticeAttachments,
  uploadBannerImage,
  uploadDocumentFile,
} from '../middlewares/upload.middleware';

const router = Router();

// Notice file attachments upload (multiple files, admin only)
router.post(
  '/attachments',
  authenticate,
  requireRole(['ADMIN']),
  uploadNoticeAttachments.array('files', 10),
  UploadController.uploadNoticeAttachments
);

// Attachment download & access endpoint (generates signed URL / redirects)
router.get('/attachments/access', optionalAuth, UploadController.getAttachmentAccessUrl);
router.post('/attachments/access', optionalAuth, UploadController.getAttachmentAccessUrl);
router.get('/attachments/download', optionalAuth, UploadController.getAttachmentAccessUrl);

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
