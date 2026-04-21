import { Router } from 'express';
import {
  create,
  list,
  listArchived,
  getById,
  update,
  restore,
  remove,
} from '../controllers/client.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

const router = Router();

router.use(verifyJwt);

router.post('/',              validate(createClientSchema), create);
router.get('/',               list);
router.get('/archived',       listArchived);
router.get('/:id',            getById);
router.put('/:id',            validate(updateClientSchema), update);
router.patch('/:id/restore',  restore);
router.delete('/:id',         remove);

export default router;
