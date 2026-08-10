import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  API_URL: process.env.API_URL || 'http://localhost:3001',

  // Database
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432'),
    NAME: process.env.DB_NAME || 'security_ia_db',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'password',
    SSL: process.env.DB_SSL === 'true',
  },

  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'dev-secret-key',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    EXPIRE: process.env.JWT_EXPIRE || '15m',
    REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // CORS
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Logging
  LOG: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE_PATH: process.env.LOG_FILE_PATH || './logs',
  },

  // WebSocket
  WS_ENABLED: process.env.WS_ENABLED !== 'false',

  // Storage
  STORAGE: {
    TYPE: (process.env.STORAGE_TYPE || 'local') as 'local' | 'cloudinary',
    PATH: process.env.STORAGE_PATH || './uploads',
  },

  // Email
  SMTP: {
    HOST: process.env.SMTP_HOST,
    PORT: parseInt(process.env.SMTP_PORT || '587'),
    USER: process.env.SMTP_USER,
    PASSWORD: process.env.SMTP_PASSWORD,
    FROM: process.env.SMTP_FROM,
  },
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_PASSWORD'];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
}
