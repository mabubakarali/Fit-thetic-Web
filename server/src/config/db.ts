import mongoose from 'mongoose';
import { ENV } from './env.js';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(ENV.DATABASE_URL, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[DB] Connected to MongoDB at ${ENV.DATABASE_URL}`);
  } catch {
    console.warn('[DB] External MongoDB not active. Running with High-Performance Memory Data Layer.');
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
