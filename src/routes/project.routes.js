import { Router } from 'express';
import {
  create,
  list,
  listArchived,
  getById,
  update,
  restore,
  remove,
} from '../controllers/project.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';
import { projectListSchema } from '../validators/pagination.validator.js';

const router = Router();

router.use(verifyJwt);

router.post('/',             validate(createProjectSchema), create);
router.get('/',              validate(projectListSchema, 'query'), list);
router.get('/archived',      listArchived);
router.get('/:id',           getById);
router.put('/:id',           validate(updateProjectSchema), update);
router.patch('/:id/restore', restore);
router.delete('/:id',        remove);

export default router;
