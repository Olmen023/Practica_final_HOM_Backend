import { AppError } from '../utils/AppError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(AppError.validation(result.error.issues));
  }
  Object.defineProperty(req, source, {
    value:        result.data,
    writable:     true,
    configurable: true,
    enumerable:   true,
  });
  next();
};
