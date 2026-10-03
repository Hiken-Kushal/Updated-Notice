import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';

const router = Router();

router.post('/', SubscriptionController.subscribe);
router.post('/subscribe', SubscriptionController.subscribe);

export default router;
