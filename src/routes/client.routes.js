import { Router } from 'express';
import { create, getById, update, remove } from '../controllers/client.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();

router.use(verifyJwt);

router.post('/',     validate(createClientSchema), create);
router.get('/:id',   getById);
router.put('/:id',   validate(updateClientSchema), update);
router.delete('/:id', remove);

export default router;
