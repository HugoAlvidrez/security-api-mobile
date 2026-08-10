import pool from '../config/database.js';
import logger from '../config/logger.js';
import { EventNotification } from '../types/index.js';

export class NotificationService {
  async notifyEventCreated(
    eventId: string,
    userId: string,
    data: any
  ): Promise<void> {
    const notification: EventNotification = {
      type: 'event_created',
      eventId,
      userId,
      data,
    };

    logger.info('Event created notification', { eventId, userId });
    // WebSocket will handle real-time notification
  }

  async notifyEventUpdated(
    eventId: string,
    userId: string,
    data: any
  ): Promise<void> {
    const notification: EventNotification = {
      type: 'event_updated',
      eventId,
      userId,
      data,
    };

    logger.info('Event updated notification', { eventId, userId });
  }

  async notifyEventResolved(
    eventId: string,
    userId: string,
    data: any
  ): Promise<void> {
    const notification: EventNotification = {
      type: 'event_resolved',
      eventId,
      userId,
      data,
    };

    logger.info('Event resolved notification', { eventId, userId });
  }

  async notifyChatMessage(
    eventId: string,
    userId: string,
    messageData: any
  ): Promise<void> {
    const notification: EventNotification = {
      type: 'chat_message',
      eventId,
      userId,
      data: messageData,
    };

    logger.info('Chat message notification', { eventId, userId });
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // In production, integrate with FCM or OneSignal
    logger.info('Push notification sent', { userId, title, body });
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<void> {
    // In production, integrate with SMTP or SendGrid
    logger.info('Email notification sent', { email, subject });
  }
}

export const notificationService = new NotificationService();
