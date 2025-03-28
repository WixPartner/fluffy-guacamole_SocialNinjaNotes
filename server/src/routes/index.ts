import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import workspaceRouter from './workspace';
import documentRouter from './document';
import fileRouter from './file';
import pagesRouter from './pages';
import aiRouter from './ai';
import subscriptionRoutes from './subscription';
import templatesRouter from './templates';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/workspaces', workspaceRouter);
router.use('/documents', documentRouter);
router.use('/files', fileRouter);
router.use('/pages', pagesRouter);
router.use('/ai', aiRouter);
router.use('/subscription', subscriptionRoutes);
router.use('/templates', templatesRouter);

export default router; 