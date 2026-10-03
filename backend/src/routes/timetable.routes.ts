import { Router } from 'express';
import { TimetableController } from '../controllers/timetable.controller';

const router = Router();

router.get('/', TimetableController.getTimetable);

export default router;
