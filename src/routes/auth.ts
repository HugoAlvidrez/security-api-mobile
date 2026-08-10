import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequestBody } from '../middleware/validation.js';
import { loginValidator, registerValidator, refreshTokenValidator } from '../utils/validators.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  validateRequestBody(registerValidator),
  (req, res, next) => authController.register(req, res, next)
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  validateRequestBody(loginValidator),
  (req, res, next) => authController.login(req, res, next)
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Private
 */
router.post(
  '/refresh',
  authMiddleware,
  validateRequestBody(refreshTokenValidator),
  (req, res, next) => authController.refreshToken(req, res, next)
);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authMiddleware, (req, res, next) =>
  authController.getProfile(req, res, next)
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authMiddleware, (req, res, next) =>
  authController.updateProfile(req, res, next)
);

export default router;
