import { z } from 'zod';

// Auth Validators
export const loginValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerValidator = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const refreshTokenValidator = z.object({
  refreshToken: z.string().min(10, 'Invalid refresh token'),
});

// Wearable Validators
export const pairWearableValidator = z.object({
  deviceId: z.string().min(5, 'Device ID is required'),
  deviceName: z.string().min(2, 'Device name is required'),
  deviceType: z.string().min(2, 'Device type is required'),
  pairingCode: z.string().min(4, 'Pairing code is required'),
});

export const updateWearableValidator = z.object({
  deviceName: z.string().min(2).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
});

// Event Validators
export const createEventValidator = z.object({
  wearableId: z.string().min(1, 'Invalid wearable ID'),
  eventType: z.enum(['emergency', 'alert', 'monitoring']),
  description: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export const updateEventValidator = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'archived']).optional(),
  description: z.string().optional(),
});

// Chat Validators
export const sendMessageValidator = z.object({
  eventId: z.string().min(1, 'Invalid event ID'),
  message: z.string().min(1, 'Message cannot be empty').max(5000),
});

// Note Validators
export const createNoteValidator = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export const updateNoteValidator = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
});

// Calendar Validators
export const createCalendarEventValidator = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  reminder: z.boolean().optional(),
  reminderMinutes: z.number().optional(),
  agentId: z.string().optional(),
});

// Stress Analysis Validators
export const stressAnalysisValidator = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  audioData: z.instanceof(Buffer).optional(),
  audioUrl: z.string().url('Invalid audio URL').optional(),
});

// Pagination Validator
export const paginationValidator = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Error response validator
export function validateInput<T>(schema: z.ZodSchema, data: unknown): T {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join('; ')}`);
    }
    throw error;
  }
}
