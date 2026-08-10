import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { pairWearableValidator, updateWearableValidator } from '../utils/validators.js';
import { ApiResponse, AppError, Wearable } from '../types/index.js';
import logger from '../config/logger.js';

export class WearableController {
  async pairWearable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = pairWearableValidator.parse(req.body);
      const client = await pool.connect();

      try {
        const wearableId = uuidv4();
        const now = new Date();

        const result = await client.query(
          `INSERT INTO "wearables" (id, "userId", "deviceId", "deviceName", "deviceType", "pairingCode", "isPaired", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            wearableId,
            req.user.userId,
            validated.deviceId,
            validated.deviceName,
            validated.deviceType,
            validated.pairingCode,
            true,
            now,
            now,
          ]
        );

        const wearable = result.rows[0] as Wearable;

        logger.info('Wearable paired successfully', {
          wearableId,
          userId: req.user.userId,
        });

        const response: ApiResponse = {
          success: true,
          message: 'Wearable paired successfully',
          data: wearable,
          timestamp: new Date(),
        };

        res.status(201).json(response);
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async getUserWearables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const client = await pool.connect();

      try {
        const result = await client.query(
          'SELECT * FROM "wearables" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
          [req.user.userId]
        );

        const wearables = result.rows as Wearable[];

        const response: ApiResponse = {
          success: true,
          message: 'Wearables retrieved',
          data: wearables,
          timestamp: new Date(),
        };

        res.json(response);
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async getWearableById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { wearableId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          'SELECT * FROM "wearables" WHERE id = $1 AND "userId" = $2',
          [wearableId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Wearable not found');
        }

        const wearable = result.rows[0] as Wearable;

        const response: ApiResponse = {
          success: true,
          message: 'Wearable retrieved',
          data: wearable,
          timestamp: new Date(),
        };

        res.json(response);
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async updateWearable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { wearableId } = req.params;
      const validated = updateWearableValidator.parse(req.body);

      const client = await pool.connect();

      try {
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        if (validated.deviceName) {
          updateFields.push(`"deviceName" = $${paramCount}`);
          updateValues.push(validated.deviceName);
          paramCount++;
        }

        if (validated.batteryLevel !== undefined) {
          updateFields.push(`"batteryLevel" = $${paramCount}`);
          updateValues.push(validated.batteryLevel);
          paramCount++;
        }

        updateFields.push(`"updatedAt" = $${paramCount}`);
        updateValues.push(new Date());
        updateValues.push(wearableId);
        updateValues.push(req.user.userId);

        const result = await client.query(
          `UPDATE "wearables" SET ${updateFields.join(', ')} 
           WHERE id = $${paramCount + 1} AND "userId" = $${paramCount + 2}
           RETURNING *`,
          updateValues
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Wearable not found');
        }

        const wearable = result.rows[0] as Wearable;

        logger.info('Wearable updated', { wearableId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Wearable updated',
          data: wearable,
          timestamp: new Date(),
        };

        res.json(response);
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteWearable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { wearableId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          'DELETE FROM "wearables" WHERE id = $1 AND "userId" = $2 RETURNING id',
          [wearableId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Wearable not found');
        }

        logger.info('Wearable deleted', { wearableId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Wearable deleted',
          timestamp: new Date(),
        };

        res.json(response);
      } finally {
        client.release();
      }
    } catch (error) {
      next(error);
    }
  }
}

export const wearableController = new WearableController();
