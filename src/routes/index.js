import { Router } from 'express';
import healthRouter from './health.routes.js';
import userRouter   from './user.routes.js';
import clientRouter from './client.routes.js';

const router = Router();

router.use('/health',      healthRouter);
router.use('/api/user',    userRouter);
router.use('/api/client',  clientRouter);

// Las rutas de recursos se irán añadiendo en commits sucesivos
// router.use('/api/project',      projectRouter);
// router.use('/api/deliverynote', deliverynoteRouter);

export default router;
