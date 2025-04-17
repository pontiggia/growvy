import Redis from 'ioredis';
import { config } from '../config/config';

export const redisClient = new Redis({
  host: config.redisHost,
  port: Number(config.redisPort),
  password: config.redisPassword,
  username: config.redisUsername,
  db: 0,
});

redisClient.on('connect', () => console.log('✅ Redis conectado'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));
