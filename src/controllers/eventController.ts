import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { createEventValidator, updateEventValidator, paginationValidator } from '../utils/validators.js';
import { ApiResponse, AppError, EmergencyEvent } from '../types/index.js';
import logger from '../config/logger.js';

export class EventController {
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = createEventValidator.parse(req.body);
      const client = await pool.connect();

      try {
        const eventId = uuidv4();
        const now = new Date();

        const result = await client.query(
          `INSERT INTO "emergency_events" (id, "userId", "wearableId", "eventType", status, description, location, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            eventId,
            req.user.userId,
            validated.wearableId,
            validated.eventType,
            'pending',
            validated.description || null,
            validated.location ? JSON.stringify(validated.location) : null,
            now,
            now,
          ]
        );

        const event = result.rows[0] as EmergencyEvent;

        logger.info('Emergency event created', {
          eventId,
          userId: req.user.userId,
          eventType: validated.eventType,
        });

        const response: ApiResponse = {
          success: true,
          message: 'Event created successfully',
          data: event,
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

  async getUserEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = paginationValidator.parse(req.query);
      const skip = (validated.page - 1) * validated.limit;

      const client = await pool.connect();

      try {
        // Get total count
        const countResult = await client.query(
          'SELECT COUNT(*) FROM "emergency_events" WHERE "userId" = $1',
          [req.user.userId]
        );
        const total = parseInt(countResult.rows[0].count);

        // Get paginated events
        const eventsResult = await client.query(
          `SELECT * FROM "emergency_events" WHERE "userId" = $1 
           ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
          [req.user.userId, validated.limit, skip]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Events retrieved',
          data: {
            events: eventsResult.rows,
            pagination: {
              page: validated.page,
              limit: validated.limit,
              total,
              totalPages: Math.ceil(total / validated.limit),
            },
          },
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

  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT * FROM "emergency_events" WHERE id = $1 AND "userId" = $2`,
          [eventId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Event not found');
        }

        const response: ApiResponse = {
          success: true,
          message: 'Event retrieved',
          data: result.rows[0],
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

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const validated = updateEventValidator.parse(req.body);

      const client = await pool.connect();

      try {
        const updateFields = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        if (validated.status) {
          updateFields.push(`status = $${paramCount}`);
          updateValues.push(validated.status);
          paramCount++;
        }

        if (validated.description) {
          updateFields.push(`description = $${paramCount}`);
          updateValues.push(validated.description);
          paramCount++;
        }

        updateFields.push(`"updatedAt" = $${paramCount}`);
        updateValues.push(new Date());
        updateValues.push(eventId);
        updateValues.push(req.user.userId);

        const result = await client.query(
          `UPDATE "emergency_events" SET ${updateFields.join(', ')}
           WHERE id = $${paramCount + 1} AND "userId" = $${paramCount + 2}
           RETURNING *`,
          updateValues
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Event not found');
        }

        logger.info('Event updated', { eventId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Event updated',
          data: result.rows[0],
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

export const eventController = new EventController();
