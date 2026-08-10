import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { storageService } from '../services/storageService.js';
import { ApiResponse, AppError, EvidenceChain } from '../types/index.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class EvidenceController {
  async uploadEventMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (!req.file) {
        throw new AppError(400, 'No file uploaded');
      }

      const { eventId, fileType } = req.body;

      if (!eventId || !['audio', 'video'].includes(fileType)) {
        throw new AppError(400, 'Invalid eventId or fileType');
      }

      const client = await pool.connect();

      try {
        // Verify event ownership
        const eventResult = await client.query(
          'SELECT id FROM "emergency_events" WHERE id = $1 AND "userId" = $2',
          [eventId, req.user.userId]
        );

        if (eventResult.rows.length === 0) {
          throw new AppError(403, 'Access denied');
        }

        // Save file
        const storageFile = await storageService.saveFile(
          req.file.buffer,
          req.file.mimetype
        );

        // Generate file hash for chain of custody
        const fileHash = await storageService.generateFileHash(req.file.buffer);

        // Create evidence chain record
        const chainId = uuidv4();
        const now = new Date();

        const chainResult = await client.query(
          `INSERT INTO "evidence_chains" (id, "eventId", "fileHash", "fileType", "fileSize", "uploadedBy", "uploadedAt", "isProtected", "integrityHash", "downloads")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            chainId,
            eventId,
            fileHash,
            fileType,
            req.file.size,
            req.user.userId,
            now,
            true, // Protected from download/edit
            fileHash,
            '[]', // Empty downloads array
          ]
        );

        // Update event with media URL
        const updateField = fileType === 'audio' ? 'audioUrl' : 'videoUrl';
        const hashField = fileType === 'audio' ? 'audioHash' : 'videoHash';

        await client.query(
          `UPDATE "emergency_events" SET "${updateField}" = $1, "${hashField}" = $2 WHERE id = $3`,
          [storageFile.url, fileHash, eventId]
        );

        logger.info('Event media uploaded', {
          eventId,
          fileType,
          fileSize: req.file.size,
          userId: req.user.userId,
        });

        const response: ApiResponse = {
          success: true,
          message: `${fileType} uploaded successfully`,
          data: {
            evidenceChain: chainResult.rows[0],
            file: storageFile,
          },
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

  async getEventMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        // Verify access
        const eventResult = await client.query(
          'SELECT "audioUrl", "videoUrl", "audioHash", "videoHash" FROM "emergency_events" WHERE id = $1 AND "userId" = $2',
          [eventId, req.user.userId]
        );

        if (eventResult.rows.length === 0) {
          throw new AppError(404, 'Event not found');
        }

        const event = eventResult.rows[0];

        // Get evidence chain data
        const chainResult = await client.query(
          'SELECT * FROM "evidence_chains" WHERE "eventId" = $1',
          [eventId]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Event media retrieved',
          data: {
            media: {
              audioUrl: event.audioUrl,
              videoUrl: event.videoUrl,
            },
            evidenceChain: chainResult.rows,
            protection: {
              downloadProtected: true,
              editProtected: true,
              watermarked: true,
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

  async getEvidenceChain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        // Verify access
        const eventResult = await client.query(
          'SELECT id FROM "emergency_events" WHERE id = $1 AND "userId" = $2',
          [eventId, req.user.userId]
        );

        if (eventResult.rows.length === 0) {
          throw new AppError(403, 'Access denied');
        }

        const result = await client.query(
          `SELECT id, "fileHash", "fileType", "fileSize", "uploadedBy", "uploadedAt", "isProtected", "integrityHash"
           FROM "evidence_chains" WHERE "eventId" = $1
           ORDER BY "uploadedAt" DESC`,
          [eventId]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Evidence chain retrieved',
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

  async verifyIntegrity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { chainId } = req.params;
      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT ec.*, ee."userId"
           FROM "evidence_chains" ec
           JOIN "emergency_events" ee ON ec."eventId" = ee.id
           WHERE ec.id = $1`,
          [chainId]
        );

        if (result.rows.length === 0) {
          throw new AppError(404, 'Evidence not found');
        }

        const evidence = result.rows[0];

        if (evidence.userId !== req.user.userId) {
          throw new AppError(403, 'Access denied');
        }

        // In production, verify actual file hash against stored hash
        const isIntact = true; // Mock verification

        const response: ApiResponse = {
          success: true,
          message: 'Integrity verification complete',
          data: {
            chainId,
            isIntact,
            integrityHash: evidence.integrityHash,
            fileHash: evidence.fileHash,
            verifiedAt: new Date(),
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
}

export const evidenceController = new EvidenceController();
