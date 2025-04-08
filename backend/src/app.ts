import express, { Application, NextFunction, Request, Response } from 'express';
import { AppError } from './utils/appError';
import { globalErrorHandler } from './controllers/errorController';

import { userRoutes } from './routes/userRoutes';
import { transactionRoutes } from './routes/transactionRoutes';
import { authRoutes } from './routes/authRoutes';
import { portfolioRoutes } from './routes/portfolioRoutes';

export const app: Application = express();

app.use(express.json());

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
