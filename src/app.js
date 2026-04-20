import express from 'express';
import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

// Captura rutas desconocidas y errores
app.use(notFound);
app.use(errorHandler);

export default app;
