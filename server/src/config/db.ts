import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  const hasRemoteDB =
    ENV.DATABASE_URL &&
    !ENV.DATABASE_URL.includes('127.0.0.1') &&
    !ENV.DATABASE_URL.includes('localhost');

  if (!hasRemoteDB) {
    console.log('[DB] No external MongoDB cluster URL provided. Running with High-Performance Memory Data Layer.');
    return;
  }

  try {
    await mongoose.connect(ENV.DATABASE_URL, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DB] Connected to MongoDB at ${ENV.DATABASE_URL}`);
  } catch {
    console.warn('[DB] External MongoDB not reachable. Running with High-Performance Memory Data Layer.');
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error('[DB] Disconnect Error:', error);
  }
}
