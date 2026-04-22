import { AppError } from '../utils/AppError.js';
import { notifySlack } from '../services/logger.service.js';

/** Captura rutas no encontradas y las convierte en AppError 404 */
export const notFound = (req, res, next) =>
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));

/** Middleware de errores centralizado — debe ir AL FINAL de app.js */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const isOperational = err.isOperational ?? false;

  // Errores no operacionales (bugs reales) — log completo + notificación Slack
  if (statusCode >= 500) {
    console.error('[ERROR 5XX]', {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
    // Notificación asíncrona — no bloqueamos la respuesta si el webhook falla
    notifySlack(err, req).catch(() => {});
  }

  res.status(statusCode).json({
    status: 'error',
    message: isOperational ? err.message : 'Ha ocurrido un error interno',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.message,
    }),
  });
};
