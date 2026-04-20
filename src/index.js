import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/database.js';
import config from './config/index.js';

const server = createServer(app);

const start = async () => {
  await connectDB(config.MONGO_URI);
  server.listen(config.PORT, () => {
    console.log(`🚀  Servidor en http://localhost:${config.PORT}`);
    console.log(`📄  Entorno: ${config.NODE_ENV}`);
  });
};

start().catch((err) => {
  console.error('❌  Error al arrancar:', err);
  process.exit(1);
});

export { server };
