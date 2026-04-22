import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Middleware de autenticación para el handshake de Socket.IO.
 * Espera el token en socket.handshake.auth.token o en la query ?token=...
 */
export const socketAuthMiddleware = (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication error: token requerido'));
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    // Adjuntar datos del usuario al socket para uso posterior
    socket.user = {
      id:        payload.id,
      companyId: payload.companyId,
      role:      payload.role,
    };
    next();
  } catch (err) {
    next(new Error('Authentication error: token inválido o expirado'));
  }
};
