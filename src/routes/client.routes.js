import { Router } from 'express';
import { create, list, getById, update, remove } from '../controllers/client.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();

router.use(verifyJwt);

router.post('/',     validate(createClientSchema), create);
router.get('/',      list);
router.get('/:id',   getById);
router.put('/:id',   validate(updateClientSchema), update);
router.delete('/:id', remove);

export default router;
