import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { JWTPayload, AppError, UserRole } from '../types/index.js';
import logger from '../config/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          userId: 'usr_001',
          email: 'maria.gonzalez@email.com',
          role: 'cliente',
        };
        logger.debug('Development mode: using default fallback user', { userId: req.user.userId });
        return next();
      }
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      logger.debug('User authenticated', { userId: payload.userId });
      next();
    } catch (tokenError) {
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          userId: 'usr_001',
          email: 'maria.gonzalez@email.com',
          role: 'cliente',
        };
        logger.debug('Development mode: token invalid, using default fallback user', { userId: req.user.userId });
        return next();
      }
      throw new AppError(401, 'Unauthorized token');
    }
  } catch (error) {
    next(new AppError(401, 'Unauthorized'));
  }
}

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'User not authenticated'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied for user', {
        userId: req.user.userId,
        role: req.user.role,
        allowedRoles,
      });
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch (error) {
    logger.debug('Optional auth failed', { error });
  }

  next();
}
