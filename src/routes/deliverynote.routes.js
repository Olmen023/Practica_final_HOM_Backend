import { Router } from 'express';
import { create, list, getById, remove } from '../controllers/deliverynote.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createDeliveryNoteSchema } from '../validators/deliverynote.validator.js';

const router = Router();

router.use(verifyJwt);

router.post('/',     validate(createDeliveryNoteSchema), create);
router.get('/',      list);
router.get('/:id',   getById);
router.delete('/:id', remove);

// Los endpoints de firma y PDF se añaden en commits siguientes:
// router.patch('/:id/sign', upload.single('signature'), sign);
// router.get('/pdf/:id',    downloadPdf);

export default router;
