import { app } from '../server/dist/app.js';
import { connectDB } from '../server/dist/config/db.js';
import { memoryStore } from '../server/dist/store/memoryStore.js';
import mongoose from 'mongoose';
import { User } from '../server/dist/models/User.js';
import { seedDatabase } from '../server/dist/scripts/seed.js';

let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    try {
      await connectDB();
      if (mongoose.connection.readyState === 1) {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          await seedDatabase();
        }
      } else {
        await memoryStore.initSeed();
      }
      isInitialized = true;
    } catch (error) {
      console.error('[Vercel Serverless] Bootstrap initialization error:', error);
      await memoryStore.initSeed();
      isInitialized = true;
    }
  }
}

export default async function handler(req, res) {
  try {
    await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Handler Error]', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVERLESS_HANDLER_ERROR',
          message: err?.message || 'Serverless invocation error',
        },
      });
    }
  }
}
