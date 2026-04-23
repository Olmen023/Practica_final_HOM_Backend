import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/database.js';
import config from './config/index.js';
import { initSocketIO } from './sockets/index.js';
import mongoose from 'mongoose';

const server = createServer(app);

// Inicializar Socket.IO sobre el mismo servidor HTTP
initSocketIO(server);

const start = async () => {
  await connectDB(config.MONGO_URI);
  server.listen(config.PORT, () => {
    console.log(`🚀  Servidor en http://localhost:${config.PORT}`);
    console.log(`📄  Entorno: ${config.NODE_ENV}`);
    console.log(`🔌  Socket.IO escuchando`);
  });
};

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
/**
 * Cierre ordenado al recibir señal de terminación.
 * 1. Deja de aceptar nuevas conexiones HTTP
 * 2. Espera a que las peticiones activas terminen (timeout 10 s)
 * 3. Cierra la conexión con MongoDB
 * 4. Sale con código 0
 */
const shutdown = (signal) => {
  console.log(`\n⚠️   Señal ${signal} recibida — iniciando graceful shutdown...`);

  server.close(async () => {
    console.log('✅  Servidor HTTP cerrado');
    try {
      await mongoose.connection.close();
      console.log('✅  Conexión MongoDB cerrada');
      process.exit(0);
    } catch (err) {
      console.error('❌  Error al cerrar MongoDB:', err.message);
      process.exit(1);
    }
  });

  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    console.error('⏱️   Timeout de shutdown alcanzado — forzando salida');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker stop / K8s pod termination
process.on('SIGINT',  () => shutdown('SIGINT'));  // Ctrl+C en desarrollo

// Captura de excepciones no controladas (prevención de caídas silenciosas)
process.on('uncaughtException', (err) => {
  console.error('🔥  uncaughtException:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('🔥  unhandledRejection:', reason);
  shutdown('unhandledRejection');
});

start().catch((err) => {
  console.error('❌  Error al arrancar:', err);
  process.exit(1);
});

export { server };
