import { Router } from 'express';
import { login, logout, protect, Me, signup } from '../middlewares/auth';

export const authRoutes = Router();

authRoutes.post('/login', login);

authRoutes.post('/signup', signup);

authRoutes.use(protect);

authRoutes.get('/me', Me);

authRoutes.get('/logout', logout);
