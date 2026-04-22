import { Router } from 'express';
import {
  create,
  list,
  getById,
  remove,
  sign,
  downloadPdf,
} from '../controllers/deliverynote.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { createDeliveryNoteSchema } from '../validators/deliverynote.validator.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.use(verifyJwt);

router.post('/',     validate(createDeliveryNoteSchema), create);
router.get('/',      list);

// OJO: /pdf/:id debe declararse ANTES de /:id para que Express no lo interprete
// como un documento con id='pdf'
router.get('/pdf/:id',    downloadPdf);
router.get('/:id',        getById);
router.delete('/:id',     remove);

router.patch('/:id/sign', upload.single('signature'), handleMulterError, sign);

export default router;
