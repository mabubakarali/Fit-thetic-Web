import { app } from './app.js';
import { connectDB } from './config/db.js';
import { memoryStore } from './store/memoryStore.js';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

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

export default async function handler(req: any, res: any) {
  try {
    await bootstrap();

    // Normalize URL if rewritten by Vercel
    if (req.url && (req.url.startsWith('/api/index.js') || req.url === '/api' || req.url === '/api/')) {
      const matched = req.headers['x-matched-path'] || req.headers['x-now-route-matches'];
      if (matched && typeof matched === 'string' && !matched.includes('index.js')) {
        const q = req.url.indexOf('?');
        req.url = matched + (q !== -1 ? req.url.substring(q) : '');
      }
    }

    return app(req, res);
  } catch (err: any) {
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
