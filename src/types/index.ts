// User Types
export type UserRole = 'super_admin' | 'operador' | 'cliente';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Wearable Types
export interface Wearable {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  pairingCode?: string;
  isPaired: boolean;
  batteryLevel?: number;
  lastConnected?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Event Types
export type EventType = 'emergency' | 'alert' | 'monitoring';
export type EventStatus = 'pending' | 'in_progress' | 'resolved' | 'archived';

export interface EmergencyEvent {
  id: string;
  userId: string;
  wearableId: string;
  eventType: EventType;
  status: EventStatus;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  audioHash?: string; // Para cadena de custodia
  videoHash?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  stressLevel?: number;
  createdAt: Date;
  resolvedAt?: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  eventId: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

// Note Types
export interface PersonalNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  reminder?: boolean;
  reminderMinutes?: number;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stress Analysis Types
export interface StressAnalysis {
  id: string;
  eventId: string;
  userId: string;
  audioUrl: string;
  stressLevel: number; // 0-100
  confidence: number; // 0-100
  voiceCharacteristics?: {
    pitch: number;
    intensity: number;
    frequency: number;
  };
  analyzedAt: Date;
  createdAt: Date;
}

// Evidence Chain of Custody
export interface EvidenceChain {
  id: string;
  eventId: string;
  fileHash: string;
  fileType: 'audio' | 'video';
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
  downloads: Array<{
    userId: string;
    timestamp: Date;
    ipAddress: string;
  }>;
  isProtected: boolean;
  watermark?: string;
  integrityHash: string;
}

// JWT Payload Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: Date;
}

// WebSocket Events
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface EventNotification {
  type: 'event_created' | 'event_updated' | 'event_resolved' | 'chat_message';
  eventId: string;
  userId: string;
  data: any;
}

// Error Types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}
