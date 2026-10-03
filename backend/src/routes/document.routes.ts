import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', DocumentController.getDocuments);
router.post('/', authenticate, requireRole(['ADMIN']), DocumentController.createDocument);
router.delete('/:id', authenticate, requireRole(['ADMIN']), DocumentController.deleteDocument);

export default router;
