import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';

export const socketAuthMiddleware = async (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token;

  if (!token) {
    return next(new Error('Authentication error: token requerido'));
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);

    let companyId = payload.companyId;
    let role      = payload.role;

    if (!companyId) {
      const user = await User.findById(payload.id).select('company role');
      if (!user || user.deleted) {
        return next(new Error('Authentication error: usuario no encontrado'));
      }
      companyId = user.company?.toString() ?? null;
      role      = user.role;
    }

    socket.user = {
      id:        payload.id,
      companyId,
      role,
    };
    next();
  } catch (err) {
    next(new Error('Authentication error: token inválido o expirado'));
  }
};
