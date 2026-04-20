import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  const conn = await mongoose.connect(uri);
  console.log(`✅  MongoDB conectado: ${conn.connection.host}`);
};

mongoose.connection.on('disconnected', () =>
  console.warn('⚠️   MongoDB desconectado')
);
mongoose.connection.on('error', (err) =>
  console.error('❌  MongoDB error:', err.message)
);
