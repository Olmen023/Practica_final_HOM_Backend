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

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado, devuelve tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/register',   validate(registerSchema),     register);
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Inicia sesión
 *     tags: [User]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Devuelve el perfil del usuario autenticado
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     summary: Elimina la cuenta del usuario
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: Si es true, hace soft delete (deleted=true)
 *     responses:
 *       200:
 *         description: Cuenta eliminada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.put('/validation',  verifyJwt, validate(verifyEmailSchema), verifyEmail);
router.post('/login',      validate(loginSchema),         login);
router.post('/refresh',    validate(refreshSchema),       refresh);
router.post('/logout',     verifyJwt,                     logout);
router.get('/',            verifyJwt,                     getMe);
router.delete('/',         verifyJwt,                     deleteAccount);

export default router;
