import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'icem-notice-jwt-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'icem-notice-jwt-refresh-super-secret-key-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URLS: process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(',').map((url) => url.trim())
    : ['http://localhost:5173', 'http://localhost:5174'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"ICEM Smart Notice Portal" <no-reply@icem.ac.in>',
};

