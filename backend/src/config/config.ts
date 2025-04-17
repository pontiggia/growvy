import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '90d',
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN || '90',
  cookieDomain: process.env.COOKIE_DOMAIN || '',
  frontendUrl: process.env.FRONTEND_URL || '',
  enviroment: process.env.NODE_ENV || 'development',
  tradingViewJwt: process.env.TRADING_VIEW_JWT || '',
  coinStatsKey: process.env.COIN_STATS_KEY || '',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: process.env.REDIS_PORT || 12209,
  redisPassword: process.env.REDIS_PASSWORD || '',
  redisUsername: process.env.REDIS_USERNAME || '',
};
