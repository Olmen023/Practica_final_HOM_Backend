import { Server } from 'socket.io';
import { socketAuthMiddleware } from './auth.middleware.js';

let io;

export const initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const { companyId } = socket.user;

    socket.join(`company:${companyId}`);
    console.log(`🔌  Socket conectado: ${socket.id} → company:${companyId}`);

    socket.on('disconnect', (reason) => {
      console.log(`🔌  Socket desconectado: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => io ?? null;
