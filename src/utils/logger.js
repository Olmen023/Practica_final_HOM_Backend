import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL
    ?? (process.env.NODE_ENV === 'test'       ? 'silent'
      : process.env.NODE_ENV === 'production' ? 'info'
      : 'debug'),

  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target:  'pino-pretty',
          options: {
            colorize:      true,
            translateTime: 'HH:MM:ss',
            ignore:        'pid,hostname',
          },
        },
      }
    : {}),
});

export default logger;
