import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../types/index.js';

export function validateRequestBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const message = error.errors
        ?.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        .join('; ') || 'Validation failed';

      next(new AppError(400, message));
    }
  };
}

export function validateRequestQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors
        ?.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        .join('; ') || 'Validation failed';

      next(new AppError(400, message));
    }
  };
}

export function validateRequestParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors
        ?.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        .join('; ') || 'Validation failed';

      next(new AppError(400, message));
    }
  };
}
