import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { createNoteValidator, updateNoteValidator } from '../utils/validators.js';
import { ApiResponse, AppError, PersonalNote } from '../types/index.js';
import logger from '../config/logger.js';

export class NoteController {
  async createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = createNoteValidator.parse(req.body);
      const client = await pool.connect();

      try {
        const noteId = uuidv4();
        const now = new Date();

        const result = await client.query(
          `INSERT INTO "personal_notes" (id, "userId", title, content, category, "isPinned", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            noteId,
            req.user.userId,
            validated.title,
            validated.content,
            validated.category || null,
            validated.isPinned || false,
            now,
            now,
          ]
        );

        const note = result.rows[0] as PersonalNote;

        logger.info('Note created', { noteId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Note created',
          data: note,
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

  async getUserNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT * FROM "personal_notes" WHERE "userId" = $1 
           ORDER BY "isPinned" DESC, "createdAt" DESC`,
          [req.user.userId]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Notes retrieved',
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

  async getNoteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { noteId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          'SELECT * FROM "personal_notes" WHERE id = $1 AND "userId" = $2',
          [noteId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Note not found');
        }

        const response: ApiResponse = {
          success: true,
          message: 'Note retrieved',
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

  async updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { noteId } = req.params;
      const validated = updateNoteValidator.parse(req.body);

      const client = await pool.connect();

      try {
        const updateFields = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        if (validated.title) {
          updateFields.push(`title = $${paramCount}`);
          updateValues.push(validated.title);
          paramCount++;
        }

        if (validated.content) {
          updateFields.push(`content = $${paramCount}`);
          updateValues.push(validated.content);
          paramCount++;
        }

        if (validated.category !== undefined) {
          updateFields.push(`category = $${paramCount}`);
          updateValues.push(validated.category);
          paramCount++;
        }

        if (validated.isPinned !== undefined) {
          updateFields.push(`"isPinned" = $${paramCount}`);
          updateValues.push(validated.isPinned);
          paramCount++;
        }

        updateFields.push(`"updatedAt" = $${paramCount}`);
        updateValues.push(new Date());
        updateValues.push(noteId);
        updateValues.push(req.user.userId);

        const result = await client.query(
          `UPDATE "personal_notes" SET ${updateFields.join(', ')}
           WHERE id = $${paramCount + 1} AND "userId" = $${paramCount + 2}
           RETURNING *`,
          updateValues
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Note not found');
        }

        logger.info('Note updated', { noteId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Note updated',
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

  async deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { noteId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          'DELETE FROM "personal_notes" WHERE id = $1 AND "userId" = $2 RETURNING id',
          [noteId, req.user.userId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Note not found');
        }

        logger.info('Note deleted', { noteId, userId: req.user.userId });

        const response: ApiResponse = {
          success: true,
          message: 'Note deleted',
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

export const noteController = new NoteController();
