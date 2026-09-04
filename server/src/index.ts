import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './scripts/seed.js';
import { User } from './models/User.js';
import { memoryStore } from './store/memoryStore.js';

async function bootstrap() {
  try {
    await connectDB();

    if (mongoose.connection.readyState === 1) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Bootstrap] Initializing MongoDB database with seed data...');
        await seedDatabase();
      }
    } else {
      console.log('[Bootstrap] Initializing In-Memory Data Store with complete seed dataset...');
      await memoryStore.initSeed();
    }

    app.listen(ENV.PORT, () => {
      console.log(`⚡ [FORGE API Server] Running on http://localhost:${ENV.PORT} (env: ${ENV.NODE_ENV})`);
    });
  } catch (error) {
    console.error('[Bootstrap Error]', error);
    process.exit(1);
  }
}

bootstrap();
