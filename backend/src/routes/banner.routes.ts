import { Router } from 'express';
import { BannerController } from '../controllers/banner.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public: get active banners
router.get('/', BannerController.getBanners);

// Admin: get all banners (including inactive)
router.get('/admin', authenticate, requireRole(['ADMIN']), BannerController.getAdminBanners);
router.post('/reset', authenticate, requireRole(['ADMIN']), BannerController.resetToPresets);

// Specific banner
router.get('/:id', BannerController.getBannerById);
router.post('/', authenticate, requireRole(['ADMIN']), BannerController.createBanner);
router.put('/:id', authenticate, requireRole(['ADMIN']), BannerController.updateBanner);
router.patch('/:id/status', authenticate, requireRole(['ADMIN']), BannerController.toggleStatus);
router.delete('/:id', authenticate, requireRole(['ADMIN']), BannerController.deleteBanner);

export default router;
