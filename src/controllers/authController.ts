import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { loginValidator, registerValidator, refreshTokenValidator } from '../utils/validators.js';
import { ApiResponse } from '../types/index.js';
import logger from '../config/logger.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerValidator.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(
        validated.email,
        validated.password,
        validated.fullName,
        validated.phoneNumber
      );

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          tokens: { accessToken, refreshToken },
        },
        timestamp: new Date(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginValidator.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(
        validated.email,
        validated.password
      );

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          tokens: { accessToken, refreshToken },
        },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = refreshTokenValidator.parse(req.body);

      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const accessToken = await authService.refreshAccessToken(req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Access token refreshed',
        data: { accessToken },
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await authService.getUserProfile(req.user.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved',
        data: user,
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await authService.updateProfile(req.user.userId, req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated',
        data: user,
        timestamp: new Date(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
