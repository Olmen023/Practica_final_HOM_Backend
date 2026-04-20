import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe,
  deleteAccount,
} from '../controllers/user.controller.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  refreshSchema,
} from '../validators/user.validator.js';

const router = Router();

router.post('/register',   validate(registerSchema),     register);
router.put('/validation',  verifyJwt, validate(verifyEmailSchema), verifyEmail);
router.post('/login',      validate(loginSchema),         login);
router.post('/refresh',    validate(refreshSchema),       refresh);
router.post('/logout',     verifyJwt,                     logout);
router.get('/',            verifyJwt,                     getMe);
router.delete('/',         verifyJwt,                     deleteAccount);

export default router;
