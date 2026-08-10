import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { EventNotification, JWTPayload } from '../types/index.js';
import logger from '../config/logger.js';

export interface SocketWithUser extends Socket {
  user?: JWTPayload;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket: SocketWithUser, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        next(new Error('Authentication required'));
        return;
      }

      try {
        const user = verifyAccessToken(token);
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: SocketWithUser) => {
      if (!socket.user) {
        socket.disconnect();
        return;
      }

      const userId = socket.user.userId;

      logger.info('User connected to WebSocket', { userId, socketId: socket.id });

      // Track user connections
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);

      // Handle event updates
      socket.on('event:subscribe', (eventId: string) => {
        socket.join(`event:${eventId}`);
        logger.debug('User subscribed to event', { userId, eventId });
      });

      socket.on('event:unsubscribe', (eventId: string) => {
        socket.leave(`event:${eventId}`);
        logger.debug('User unsubscribed from event', { userId, eventId });
      });

      // Handle chat messages
      socket.on('chat:message', (data: { eventId: string; message: string }) => {
        logger.debug('Chat message received', { userId, eventId: data.eventId });
        this.io.to(`event:${data.eventId}`).emit('chat:new_message', {
          userId,
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle stress analysis updates
      socket.on('stress:update', (data: { eventId: string; level: number }) => {
        logger.debug('Stress update received', { userId, eventId: data.eventId });
        this.io.to(`event:${data.eventId}`).emit('stress:updated', {
          userId,
          ...data,
          timestamp: new Date(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
        logger.info('User disconnected from WebSocket', { userId, socketId: socket.id });
      });
    });
  }

  // Emit event notification to specific user
  public notifyUser(userId: string, notification: EventNotification): void {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Emit event update to all users subscribed to event
  public notifyEventSubscribers(eventId: string, data: any): void {
    this.io.to(`event:${eventId}`).emit('event:updated', data);
  }

  // Broadcast event to all connected users of specific role
  public broadcastToRole(role: string, notification: EventNotification): void {
    // In production, would filter sockets by user role
    this.io.emit('notification', notification);
  }

  // Get number of connected users
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get all sockets for a specific user
  public getUserSockets(userId: string): string[] {
    const sockets = this.connectedUsers.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let wsManager: WebSocketManager;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  wsManager = new WebSocketManager(httpServer);
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager {
  return wsManager;
}
