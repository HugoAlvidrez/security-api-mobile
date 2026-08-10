import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { ENV } from './config/env.js';
import { initializeDatabase } from './config/database.js';
import logger from './config/logger.js';
import { initializeWebSocket } from './websocket/events.js';

// Routes
import authRoutes from './routes/auth.js';
import wearableRoutes from './routes/wearables.js';
import eventRoutes from './routes/events.js';
import chatRoutes from './routes/chat.js';
import noteRoutes from './routes/notes.js';
import calendarRoutes from './routes/calendar.js';
import evidenceRoutes from './routes/evidence.js';

// Middleware
import { errorHandlerMiddleware, notFoundMiddleware } from './middleware/errorHandler.js';
import { ApiResponse } from './types/index.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const httpServer = createServer(app);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SecurityIA Fem Mobile API',
      version: '1.0.0',
      description: 'Backend API for SecurityIA Fem mobile application',
      contact: {
        name: 'SecurityIA Team',
        email: 'support@securityiafem.com',
      },
    },
    servers: [
      {
        url: `${ENV.API_URL}/api`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// === MIDDLEWARE ===

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: ENV.CORS.ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: ENV.RATE_LIMIT.WINDOW_MS,
  max: ENV.RATE_LIMIT.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// === API DOCUMENTATION ===
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === HEALTH CHECK ===
app.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: ENV.NODE_ENV,
    },
    timestamp: new Date(),
  };

  res.json(response);
});

app.get('/api/status', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'API status OK',
    data: {
      service: 'SecurityIA Backend',
      environment: ENV.NODE_ENV,
      uptime: process.uptime(),
    },
    timestamp: new Date(),
  };

  res.json(response);
});

// === API ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/wearables', wearableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/evidence', evidenceRoutes);

// === WEB FRONTEND COMPATIBILITY ALIASES ===
app.get('/api/users/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: 'u2',
      email: 'operador@securityiafem.com',
      fullName: 'Mariana López',
      role: 'operador',
    },
  });
});

app.get('/api/devices', async (_req: Request, res: Response) => {
  const db = (await import('./config/database.js')).default;
  const result = await db.query('SELECT * FROM "wearables"');
  res.json({ success: true, data: result.rows });
});

app.get('/api/clients', async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'c1',
        nombre: 'María González',
        email: 'maria.gonzalez@email.com',
        telefono: '+52 55 5555 1234',
        plan: 'Premium Guard',
        estado: 'activo',
        dispositivoVinculado: 'Pulsera Sensorial Smart 01 (DEV-9982-S)',
        fechaRegistro: '2026-01-15',
        alertasHistoricas: 4,
      },
      {
        id: 'c2',
        nombre: 'Elena Rostova',
        email: 'elena.rostova@email.com',
        telefono: '+52 55 8888 9999',
        plan: 'Standard Protect',
        estado: 'activo',
        dispositivoVinculado: 'Colgante Antipánico (DEV-4412-A)',
        fechaRegistro: '2026-02-01',
        alertasHistoricas: 2,
      },
    ],
  });
});

app.get('/api/users', async (_req: Request, res: Response) => {
  const db = (await import('./config/database.js')).default;
  const result = await db.query('SELECT * FROM "users"');
  res.json({ success: true, data: result.rows });
});

app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'log-1',
        fechaHora: new Date().toISOString(),
        usuario: 'Mariana López (Operador)',
        accion: 'RECEPCION_ALERTA',
        detalle: 'Atención a evento de emergencia evt_001 desde app móvil',
        ip: '192.168.1.105',
        modulo: 'Chat / Monitoreo',
      },
      {
        id: 'log-2',
        fechaHora: new Date(Date.now() - 1800000).toISOString(),
        usuario: 'Valentina Torres (SuperAdmin)',
        accion: 'VERIFICACION_EVIDENCIA',
        detalle: 'Verificación de hash de custodia para video evt_001',
        ip: '192.168.1.100',
        modulo: 'Evidencia',
      },
    ],
  });
});

app.get('/api/emergency-events', async (_req: Request, res: Response) => {
  const db = (await import('./config/database.js')).default;
  const result = await db.query('SELECT * FROM "emergency_events"');
  res.json({ success: true, data: result.rows });
});

app.post('/api/emergency-events', async (req: Request, res: Response) => {
  const db = (await import('./config/database.js')).default;
  const { alert_type, description, latitude, longitude } = req.body;
  const newEv = await db.query(
    `INSERT INTO "emergency_events" (id, "userId", "wearableId", "eventType", status, description, location, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      `evt_${Date.now()}`,
      'usr_001',
      'w_001',
      alert_type || 'emergency',
      'pending',
      description || 'Alerta de emergencia recibida',
      JSON.stringify({ latitude: latitude || 19.4326, longitude: longitude || -99.1332 }),
      new Date(),
      new Date(),
    ]
  );
  res.status(201).json({ success: true, data: newEv.rows[0] });
});


// === STATIC STRESS ANALYSIS ENDPOINT ===
app.post('/api/stress-analysis', async (req: Request, res: Response) => {
  try {
    // Import here to avoid circular dependencies
    const { stressAnalysisService } = await import('./services/stressAnalysisService.js');

    const { eventId, userId, audioUrl } = req.body;

    if (!eventId || !userId || !audioUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        timestamp: new Date(),
      });
    }

    const analysis = await stressAnalysisService.analyzeAudio(eventId, userId, audioUrl);

    res.json({
      success: true,
      message: 'Stress analysis completed',
      data: analysis,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Stress analysis error', error);
    res.status(500).json({
      success: false,
      message: 'Analysis failed',
      timestamp: new Date(),
    });
  }
});

// === ERROR HANDLING ===
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// === WEBSOCKET ===
const wsManager = initializeWebSocket(httpServer);

// === SERVER STARTUP ===
async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();

    // Start HTTP server
    httpServer.listen(ENV.PORT, () => {
      logger.info('🚀 Server started successfully', {
        port: ENV.PORT,
        environment: ENV.NODE_ENV,
        websocket: ENV.WS_ENABLED,
      });

      logger.info('📚 API Documentation available at', {
        url: `${ENV.API_URL}/api-docs`,
      });
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

// === GRACEFUL SHUTDOWN ===
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  httpServer.close(async () => {
    logger.info('HTTP server closed');

    const { closeDatabase } = await import('./config/database.js');
    await closeDatabase();

    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  httpServer.close(async () => {
    logger.info('HTTP server closed');

    const { closeDatabase } = await import('./config/database.js');
    await closeDatabase();

    process.exit(0);
  });
});

// === UNCAUGHT EXCEPTION HANDLER ===
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();

export { app, httpServer, wsManager };
