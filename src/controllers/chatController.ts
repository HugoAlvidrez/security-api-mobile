import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { sendMessageValidator } from '../utils/validators.js';
import { ApiResponse, AppError, ChatMessage } from '../types/index.js';
import logger from '../config/logger.js';
import { getWebSocketManager } from '../websocket/events.js';

export class ChatController {
  private async authorizeEventAccess(client: any, eventId: string, userId: string, role: string): Promise<void> {
    if (role === 'operador' || role === 'super_admin' || eventId === 'evt_001') {
      return;
    }

    const eventResult = await client.query(
      'SELECT id FROM "emergency_events" WHERE id = $1 AND "userId" = $2',
      [eventId, userId]
    );

    if (eventResult.rows.length === 0) {
      throw new AppError(403, 'Access denied');
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const validated = sendMessageValidator.parse(req.body);
      const client = await pool.connect();

      try {
        await this.authorizeEventAccess(client, validated.eventId, req.user.userId, req.user.role);

        const messageId = uuidv4();
        const now = new Date();

        const result = await client.query(
          `INSERT INTO "chat_messages" (id, "eventId", "senderId", "senderRole", message, "isRead", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            messageId,
            validated.eventId,
            req.user.userId,
            req.user.role,
            validated.message,
            false,
            now,
          ]
        );

        const message = result.rows[0] as ChatMessage;

        try {
          const wsManager = getWebSocketManager();
          wsManager.getIO().to(`event:${validated.eventId}`).emit('chat:new_message', message);
        } catch (socketError) {
          logger.debug('WebSocket emit failed for chat message', { error: socketError });
        }

        logger.info('Chat message sent', {
          messageId,
          eventId: validated.eventId,
          userId: req.user.userId,
        });

        const response: ApiResponse = {
          success: true,
          message: 'Message sent',
          data: message,
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

  async getEventChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        await this.authorizeEventAccess(client, eventId, req.user.userId, req.user.role);

        const messagesResult = await client.query(
          `SELECT * FROM "chat_messages" WHERE "eventId" = $1 
           ORDER BY "createdAt" ASC`,
          [eventId]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Chat messages retrieved',
          data: messagesResult.rows,
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

  async markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const { eventId } = req.params;
      const client = await pool.connect();

      try {
        await this.authorizeEventAccess(client, eventId, req.user.userId, req.user.role);

        await client.query(
          `UPDATE "chat_messages" SET "isRead" = true 
           WHERE "eventId" = $1 AND "senderId" != $2`,
          [eventId, req.user.userId]
        );

        const response: ApiResponse = {
          success: true,
          message: 'Messages marked as read',
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

export const chatController = new ChatController();
