import { AppError } from '../utils/AppError.js';

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized());
  }
  if (!roles.includes(req.user.role)) {
    return next(
      AppError.forbidden(
        `Se requiere el rol ${roles.join(' o ')} para esta acción`
      )
    );
  }
  next();
};
