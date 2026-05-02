import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

export const dbConnect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

export const dbClear = async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const dbClose = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};
