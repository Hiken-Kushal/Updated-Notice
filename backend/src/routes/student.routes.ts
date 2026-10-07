import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Student-specific bookmarks & acknowledgements
router.get('/bookmarks', authenticate, requireRole(['STUDENT']), StudentController.getBookmarks);
router.get('/acknowledgements', authenticate, requireRole(['STUDENT']), StudentController.getAcknowledgements);

// Toggles for notices (mounted under /api/v1/notices/:id/...)
export const noticeStudentRouter = Router({ mergeParams: true });
noticeStudentRouter.post('/acknowledge', authenticate, requireRole(['STUDENT']), StudentController.toggleAcknowledge);
noticeStudentRouter.post('/bookmark', authenticate, requireRole(['STUDENT']), StudentController.toggleBookmark);

export default router;
