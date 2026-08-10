import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { createCalendarEventValidator } from '../utils/validators.js';
import { ApiResponse, AppError, CalendarEvent } from '../types/index.js';
import logger from '../config/logger.js';

export class CalendarController {
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = createCalendarEventValidator.parse(req.body);
      const client = await pool.connect();

      try {
        const eventId = uuidv4();
        const now = new Date();

        const result = await client.query(
          `INSERT INTO "calendar_events" (id, "userId", title, description, "startTime", "endTime", reminder, "reminderMinutes", "agentId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            eventId,
            req.user.userId,
            validated.title,
            validated.description || null,
            new Date(validated.startTime),
            new Date(validated.endTime),
            validated.reminder || false,
            validated.reminderMinutes || null,
            validated.agentId || null,
            now,
            now,
          ]
        );

        const event = result.rows[0] as CalendarEvent;

        logger.info('Calendar event created', { eventId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Event created',
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

  async getUpcomingEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const client = await pool.connect();

      try {
        const now = new Date();

        const result = await client.query(
          `SELECT * FROM "calendar_events" 
           WHERE "userId" = $1 AND "startTime" >= $2
           ORDER BY "startTime" ASC`,
          [req.user.userId, now]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Events retrieved',
          data: result.rows,
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
          'SELECT * FROM "calendar_events" WHERE id = $1 AND "userId" = $2',
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
      const client = await pool.connect();

      try {
        const updateFields = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        if (req.body.title) {
          updateFields.push(`title = $${paramCount}`);
          updateValues.push(req.body.title);
          paramCount++;
        }

        if (req.body.description) {
          updateFields.push(`description = $${paramCount}`);
          updateValues.push(req.body.description);
          paramCount++;
        }

        if (req.body.startTime) {
          updateFields.push(`"startTime" = $${paramCount}`);
          updateValues.push(new Date(req.body.startTime));
          paramCount++;
        }

        if (req.body.endTime) {
          updateFields.push(`"endTime" = $${paramCount}`);
          updateValues.push(new Date(req.body.endTime));
          paramCount++;
        }

        updateFields.push(`"updatedAt" = $${paramCount}`);
        updateValues.push(new Date());
        updateValues.push(eventId);
        updateValues.push(req.user.userId);

        const result = await client.query(
          `UPDATE "calendar_events" SET ${updateFields.join(', ')}
           WHERE id = $${paramCount + 1} AND "userId" = $${paramCount + 2}
           RETURNING *`,
          updateValues
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Event not found');
        }

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

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          'DELETE FROM "calendar_events" WHERE id = $1 AND "userId" = $2 RETURNING id',
          [eventId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Event not found');
        }

        logger.info('Calendar event deleted', { eventId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Event deleted',
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

export const calendarController = new CalendarController();
