import { AppError } from '../utils/AppError.js';

/**
 * Middleware genérico de validación Zod.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source - dónde buscar los datos
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(AppError.validation(result.error.issues));
  }
  req[source] = result.data;
  next();
};
