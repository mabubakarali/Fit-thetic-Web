import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/forge_gym',
  JWT_SECRET: process.env.JWT_SECRET || 'forge_gym_ultra_secure_production_secret_key_2026_x89f',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GYM_TIMEZONE: process.env.GYM_TIMEZONE || 'Asia/Karachi',
};
