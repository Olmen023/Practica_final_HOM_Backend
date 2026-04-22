import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { globalLimiter } from './middleware/rate-limit.js';

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet());                  // cabeceras HTTP seguras
app.use(mongoSanitize());           // previene inyección NoSQL ($, .)
app.use(hpp());                     // previene contaminación de parámetros HTTP
app.use(globalLimiter);             // rate limit global (200 req / 15 min)

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/', router);

// ── Manejo de errores ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
