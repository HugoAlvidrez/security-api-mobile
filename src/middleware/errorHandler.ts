import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../types/index.js';
import logger from '../config/logger.js';
import { ENV } from '../config/env.js';

export function errorHandlerMiddleware(
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;
  const message =
    error instanceof AppError ? error.message : 'Internal server error';

  logger.error('Request error', {
    statusCode,
    message,
    stack: error.stack,
  });

  const response: ApiResponse = {
    success: false,
    message,
    error: ENV.NODE_ENV === 'development' ? error.message : 'An error occurred',
    timestamp: new Date(),
  };

  return res.status(statusCode).json(response);
}

export function notFoundMiddleware(
  _req: Request,
  res: Response
): Response {
  const response: ApiResponse = {
    success: false,
    message: 'Resource not found',
    timestamp: new Date(),
  };

  return res.status(404).json(response);
}
