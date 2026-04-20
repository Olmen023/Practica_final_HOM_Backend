import { Router } from 'express';
import healthRouter from './health.routes.js';

const router = Router();

router.use('/health', healthRouter);

// Las rutas de recursos se irán añadiendo en commits sucesivos
// router.use('/api/user',         userRouter);
// router.use('/api/client',       clientRouter);
// router.use('/api/project',      projectRouter);
// router.use('/api/deliverynote', deliverynoteRouter);

export default router;
