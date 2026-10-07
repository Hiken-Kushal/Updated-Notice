import { Router } from 'express';
import authRoutes from './auth.routes';
import noticeRoutes from './notice.routes';
import studentRoutes, { noticeStudentRouter } from './student.routes';
import bannerRoutes from './banner.routes';
import documentRoutes from './document.routes';
import timetableRoutes from './timetable.routes';
import subscriptionRoutes from './subscription.routes';
import uploadRoutes from './upload.routes';
import userRoutes from './user.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/notices/:id', noticeStudentRouter);
apiRouter.use('/student', studentRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/timetable', timetableRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/users', userRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ICEM Smart Notice Portal Backend',
  });
});

export default apiRouter;
