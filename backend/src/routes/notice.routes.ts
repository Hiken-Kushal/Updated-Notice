import { Router } from 'express';
import { NoticeController } from '../controllers/notice.controller';
import { StudentController } from '../controllers/student.controller';
import { authenticate, optionalAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public / student notice browsing (optionalAuth attaches student if logged in)
router.get('/', optionalAuth, NoticeController.getNotices);
router.get('/stats', authenticate, requireRole(['ADMIN']), NoticeController.getStats);
router.get('/action-required', NoticeController.getActionRequired);
router.get('/calendar', NoticeController.getCalendar);
router.get('/:id', optionalAuth, NoticeController.getNoticeById);

// Student notice interactions
router.post('/:id/acknowledge', optionalAuth, StudentController.toggleAcknowledge);
router.post('/:id/bookmark', optionalAuth, StudentController.toggleBookmark);

// Admin-only management routes
router.post('/', authenticate, requireRole(['ADMIN']), NoticeController.createNotice);
router.put('/:id', authenticate, requireRole(['ADMIN']), NoticeController.updateNotice);
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), NoticeController.toggleStatus);
router.delete('/:id', authenticate, requireRole(['ADMIN']), NoticeController.deleteNotice);

export default router;
