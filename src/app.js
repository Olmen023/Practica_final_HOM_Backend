import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { globalLimiter } from './middleware/rate-limit.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      imgSrc:        ["'self'", 'data:', 'https:'],
      connectSrc:    ["'self'"],
      fontSrc:       ["'self'", 'https:', 'data:'],
      objectSrc:     ["'none'"],
      frameAncestors:["'self'"],
      baseUri:       ["'self'"],
      formAction:    ["'self'"],
    },
  },
}));
app.use(cors({ origin: true }));
app.use((req, _res, next) => {
  Object.defineProperty(req, 'query', {
    value:        { ...req.query },
    writable:     true,
    configurable: true,
    enumerable:   true,
  });
  next();
});
app.use(mongoSanitize());
app.use(hpp());
app.use(globalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'BildyApp API Docs',
}));

app.use(express.static('public'));

app.use('/', router);

app.use(notFound);
app.use(errorHandler);

export default app;
