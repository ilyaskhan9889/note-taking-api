import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'notes_db',
    user: process.env.DB_USER || 'notes_user',
    password: process.env.DB_PASSWORD || 'notes_password'
  },
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS || 60)
};

export default config;
