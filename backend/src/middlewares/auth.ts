import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

import { User } from '../models/userModel';
import AppError from '../utils/appError';
import { config } from '../config/config';
import { IUser, SignupUser } from '../types/user';
import { TransactionService } from '../services/transactionService';
import { PortfolioService } from '../services/portfolioService';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const JWT_SECRET: Secret = config.jwtSecret;
const JWT_EXPIRES_IN: string | number = config.jwtExpiresIn;
const JWT_COOKIE_EXPIRES_IN = config.jwtCookieExpiresIn;

const signToken = (id: string): string => {
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign({ id }, JWT_SECRET, signOptions);
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response,
): void => {
  const token = signToken(user._id as string);
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true as const,
    sameSite: 'none' as const,
    secure: true as const,
    domain: config.cookieDomain,
  };

  res.cookie('jwt', token, cookieOptions);

  if ('password' in user) {
    user.password = 'undefined';
  }

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body.authProvider = 'local';
  const newUser = await User.create(req.body as SignupUser);

  createSendToken(newUser, 201, res);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter your email and password', 400));
  }

  const user = (await User.findOne({ email }).select('+password')) as IUser;

  if (!user || !(await user.correctPassword(password, user.password!))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    domain: config.cookieDomain,
  });
  res.status(200).json({ status: 'success' });
};

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const cookie = req.headers.cookie;
  if (cookie) {
    token = cookie.split('=')[1];
  }

  if (!token) {
    return next(new AppError('You need to log in to access this route', 401));
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid token or expired', 401));
    }

    const payload = decoded as jwt.JwtPayload;

    const currentUser = (await User.findById(payload.id)) as IUser;
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging this token does not longer exists',
          401,
        ),
      );
    }

    req.user = currentUser;
    next();
  });
};

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return next();
      }

      const payload = decoded as jwt.JwtPayload;

      const currentUser = (await User.findById(payload.id)) as IUser;
      if (!currentUser) {
        return next();
      }

      req.user = currentUser;
      return next();
    });
  } else {
    next();
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role!)) {
      return next(
        new AppError('You dont have permission to perform this action', 403),
      );
    }
    next();
  };
};

export const Me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 400));
    }
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ data: { user } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const isTransactionOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const transaction = await TransactionService.getTransactionById(
      req.params.id,
    );

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    if (transaction.user.toString() !== req.user?._id?.toString()) {
      res
        .status(403)
        .json({ error: 'Not authorized to access this transaction' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    return;
  }
};

export const isPortfolioOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const portfolio = await PortfolioService.getPortfolioById(req.params.id);

    if (portfolio.ownerId.toString() !== req.user?._id?.toString()) {
      res
        .status(403)
        .json({ error: 'Not authorized to access this portfolio' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
    return; // Correctamente detiene la ejecución
  }
};
