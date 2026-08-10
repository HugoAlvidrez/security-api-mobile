import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { User, JWTPayload, AppError } from '../types/index.js';
import logger from '../config/logger.js';

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const client = await pool.connect();

    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM "users" WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError(409, 'Email already registered');
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(password, 12);

      // Create user
      const userId = uuidv4();
      const now = new Date();

      const result = await client.query(
        `INSERT INTO "users" (id, email, "passwordHash", "fullName", "phoneNumber", role, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, "fullName", "phoneNumber", role, "isActive", "createdAt", "updatedAt"`,
        [userId, email, passwordHash, fullName, phoneNumber, 'cliente', true, now, now]
      );

      const user = result.rows[0] as User;

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      logger.info('User registered successfully', { userId: user.id, email });

      return { user, accessToken, refreshToken };
    } finally {
      client.release();
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const client = await pool.connect();

    try {
      // Find user
      const result = await client.query(
        'SELECT * FROM "users" WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        logger.warn('Login failed: user not found', { email });
        throw new AppError(401, 'Invalid email or password');
      }

      const user = result.rows[0] as User;

      // Verify password
      const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        logger.warn('Login failed: invalid password', { email });
        throw new AppError(401, 'Invalid email or password');
      }

      if (!user.isActive) {
        logger.warn('Login failed: user inactive', { email });
        throw new AppError(403, 'User account is inactive');
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      logger.info('User logged in successfully', { userId: user.id, email });

      return { user, accessToken, refreshToken };
    } finally {
      client.release();
    }
  }

  async refreshAccessToken(userId: string): Promise<string> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT id, email, role FROM "users" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(401, 'User not found');
      }

      const user = result.rows[0];

      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);

      logger.debug('Access token refreshed', { userId });

      return accessToken;
    } finally {
      client.release();
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT id, email, "fullName", "phoneNumber", role, "profileImage", "isActive", "createdAt", "updatedAt" FROM "users" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'User not found');
      }

      return result.rows[0] as User;
    } finally {
      client.release();
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const client = await pool.connect();

    try {
      const allowedFields = ['fullName', 'phoneNumber', 'profileImage'];
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`"${key}" = $${paramCount}`);
          updateValues.push(value);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        throw new AppError(400, 'No valid fields to update');
      }

      updateFields.push(`"updatedAt" = $${paramCount}`);
      updateValues.push(new Date());
      updateValues.push(userId);

      const result = await client.query(
        `UPDATE "users" SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1}
         RETURNING id, email, "fullName", "phoneNumber", role, "profileImage", "isActive", "createdAt", "updatedAt"`,
        updateValues
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'User not found');
      }

      logger.info('User profile updated', { userId });
      return result.rows[0] as User;
    } finally {
      client.release();
    }
  }
}

export const authService = new AuthService();
