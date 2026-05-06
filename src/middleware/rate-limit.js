import rateLimit from 'express-rate-limit';

const defaults = {
  standardHeaders: true,
  legacyHeaders:   false,
  handler: (_req, res) => {
    res.status(429).json({
      status:  'error',
      message: 'Demasiadas peticiones, inténtalo de nuevo más tarde.',
    });
  },
};

export const globalLimiter = rateLimit({
  ...defaults,
  windowMs: 15 * 60 * 1000,
  limit:    200,
});

export const authLimiter = rateLimit({
  ...defaults,
  windowMs: 15 * 60 * 1000,
  limit:    20,
  message:  'Demasiados intentos de autenticación, inténtalo en 15 minutos.',
});

export const writeLimiter = rateLimit({
  ...defaults,
  windowMs: 10 * 60 * 1000,
  limit:    100,
});
