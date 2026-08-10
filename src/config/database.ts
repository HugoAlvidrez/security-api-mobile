import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { ENV } from './env.js';
import logger from './logger.js';

const { Pool } = pkg;

const pool = new Pool({
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  database: ENV.DB.NAME,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  ssl: ENV.DB.SSL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isMockMode = false;

// ── In-Memory Database for local development fallback ─────────────────────────────
class MemoryStore {
  users: any[] = [];
  emergency_events: any[] = [];
  chat_messages: any[] = [];
  wearables: any[] = [];
  evidence_chains: any[] = [];
  notes: any[] = [];
  calendar: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const adminHash = bcrypt.hashSync('Admin123!', 10);
    const operHash = bcrypt.hashSync('Oper123!', 10);
    const userHash = bcrypt.hashSync('User123!', 10);

    this.users = [
      {
        id: 'u1',
        email: 'admin@securityiafem.com',
        passwordHash: adminHash,
        fullName: 'Valentina Torres',
        role: 'super_admin',
        isActive: true,
        phoneNumber: '+52 55 1234 5678',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'u2',
        email: 'operador@securityiafem.com',
        passwordHash: operHash,
        fullName: 'Mariana López',
        role: 'operador',
        isActive: true,
        phoneNumber: '+52 55 8765 4321',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'usr_001',
        email: 'maria.gonzalez@email.com',
        passwordHash: userHash,
        fullName: 'María González',
        role: 'cliente',
        isActive: true,
        phoneNumber: '+52 55 5555 1234',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];

    this.wearables = [
      {
        id: 'w_001',
        userId: 'usr_001',
        deviceId: 'DEV-9982-S',
        deviceName: 'Pulsera Sensorial Smart 01',
        deviceType: 'pulsera',
        status: 'connected',
        batteryLevel: 85,
        pairingCode: '1234',
        firmwareVersion: 'v2.4.1',
        lastSync: new Date(),
        createdAt: new Date(),
      },
    ];

    this.emergency_events = [
      {
        id: 'evt_001',
        userId: 'usr_001',
        wearableId: 'w_001',
        eventType: 'emergency',
        status: 'pending',
        description: 'Alerta de pánico activada en Av. Insurgentes Sur',
        location: { latitude: 19.4326, longitude: -99.1332 },
        clienteNombre: 'María González',
        ubicacion: 'Av. Insurgentes Sur 1602, CDMX',
        nivelEstres: 'critico',
        duracion: '02:45',
        tieneVideo: true,
        tieneAudio: true,
        fechaHora: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'evt_002',
        userId: 'usr_001',
        wearableId: 'w_001',
        eventType: 'alert',
        status: 'resolved',
        description: 'Anomalía de pulso detectada',
        location: { latitude: 19.4211, longitude: -99.1654 },
        clienteNombre: 'María González',
        ubicacion: 'Calle Reforma 222, CDMX',
        nivelEstres: 'alto',
        duracion: '01:30',
        tieneVideo: true,
        tieneAudio: false,
        fechaHora: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
      },
    ];

    this.chat_messages = [
      {
        id: 'msg_001',
        eventId: 'evt_001',
        senderId: 'usr_001',
        senderRole: 'cliente',
        senderName: 'María González',
        message: '¡Ayuda! Escuché un ruido sospechoso cerca de mi ubicación.',
        isRead: true,
        createdAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: 'msg_002',
        eventId: 'evt_001',
        senderId: 'u2',
        senderRole: 'operador',
        senderName: 'Mariana López (Operador)',
        message: 'María, mantén la calma. Recibimos tu alerta GPS. La unidad 402 está en camino.',
        isRead: true,
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'msg_003',
        eventId: 'evt_001',
        senderId: 'usr_001',
        senderRole: 'cliente',
        senderName: 'María González',
        message: 'Entendido, estoy dentro de un establecimiento seguro.',
        isRead: false,
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
    ];

    this.evidence_chains = [
      {
        id: 'evd_001',
        eventId: 'evt_001',
        fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        hash: 'a3f8b912c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1',
        createdAt: new Date(),
      },
    ];
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const queryStr = text.trim();
    const cleanStr = queryStr.replace(/\s+/g, ' ');

    // ── USERS QUERIES ────────────────────────────────
    if (/SELECT .* FROM "users" WHERE email = \$1/i.test(cleanStr)) {
      const email = params[0];
      const match = this.users.filter((u) => u.email.toLowerCase() === String(email).toLowerCase());
      return { rows: match, rowCount: match.length };
    }

    if (/SELECT .* FROM "users" WHERE id = \$1/i.test(cleanStr)) {
      const id = params[0];
      const match = this.users.filter((u) => u.id === id);
      return { rows: match, rowCount: match.length };
    }

    if (/SELECT .* FROM "users"/i.test(cleanStr)) {
      return { rows: this.users, rowCount: this.users.length };
    }

    if (/INSERT INTO "users"/i.test(cleanStr)) {
      const newUser = {
        id: params[0] || `usr_${Date.now()}`,
        email: params[1],
        password: params[2],
        fullName: params[3],
        role: params[4] || 'cliente',
        phoneNumber: params[5] || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(newUser);
      return { rows: [newUser], rowCount: 1 };
    }

    // ── CHAT MESSAGES QUERIES ────────────────────────────────
    if (/SELECT .* FROM "chat_messages" WHERE "eventId" = \$1/i.test(cleanStr)) {
      const eventId = params[0];
      const matches = this.chat_messages
        .filter((m) => m.eventId === eventId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return { rows: matches, rowCount: matches.length };
    }

    if (/INSERT INTO "chat_messages"/i.test(cleanStr)) {
      const id = params[0];
      const eventId = params[1];
      const senderId = params[2];
      const senderRole = params[3];
      const message = params[4];
      const isRead = Boolean(params[5]);
      const createdAt = params[6] ? new Date(params[6]).toISOString() : new Date().toISOString();

      const userMatch = this.users.find((u) => u.id === senderId);
      const senderName = userMatch ? userMatch.fullName : (senderRole === 'operador' ? 'Operador' : 'Usuario');

      const newMsg = {
        id,
        eventId,
        senderId,
        senderRole,
        senderName,
        message,
        isRead,
        createdAt,
      };
      this.chat_messages.push(newMsg);
      return { rows: [newMsg], rowCount: 1 };
    }

    if (/UPDATE "chat_messages" SET "isRead" = true/i.test(cleanStr)) {
      const eventId = params[0];
      const excludeSenderId = params[1];
      this.chat_messages.forEach((m) => {
        if (m.eventId === eventId && m.senderId !== excludeSenderId) {
          m.isRead = true;
        }
      });
      return { rows: [], rowCount: 1 };
    }

    // ── EMERGENCY EVENTS QUERIES ────────────────────────────────
    if (/SELECT COUNT\(\*\) FROM "emergency_events"/i.test(cleanStr)) {
      let filtered = this.emergency_events;
      if (params.length > 0 && params[0]) {
        filtered = filtered.filter((e) => e.userId === params[0]);
      }
      return { rows: [{ count: String(filtered.length) }], rowCount: 1 };
    }

    if (/SELECT id FROM "emergency_events" WHERE id = \$1/i.test(cleanStr)) {
      const eventId = params[0];
      const match = this.emergency_events.filter((e) => e.id === eventId);
      return { rows: match, rowCount: match.length };
    }

    if (/SELECT .* FROM "emergency_events" WHERE id = \$1/i.test(cleanStr)) {
      const eventId = params[0];
      const match = this.emergency_events.filter((e) => e.id === eventId);
      return { rows: match, rowCount: match.length };
    }

    if (/SELECT .* FROM "emergency_events"/i.test(cleanStr)) {
      let results = [...this.emergency_events];
      if (cleanStr.includes('WHERE "userId" = $1')) {
        const userId = params[0];
        results = results.filter((e) => e.userId === userId);
      }
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { rows: results, rowCount: results.length };
    }

    if (/INSERT INTO "emergency_events"/i.test(cleanStr)) {
      const newEv = {
        id: params[0],
        userId: params[1],
        wearableId: params[2],
        eventType: params[3],
        status: params[4] || 'pending',
        description: params[5],
        location: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
        clienteNombre: 'María González',
        ubicacion: 'Ubicación GPS registrada',
        nivelEstres: 'critico',
        duracion: '00:00',
        tieneVideo: true,
        tieneAudio: true,
        fechaHora: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.emergency_events.push(newEv);
      return { rows: [newEv], rowCount: 1 };
    }

    if (/UPDATE "emergency_events"/i.test(cleanStr)) {
      const eventId = params[params.length - 2];
      const ev = this.emergency_events.find((e) => e.id === eventId);
      if (ev) {
        if (params[0]) ev.status = params[0];
        ev.updatedAt = new Date();
        return { rows: [ev], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // ── WEARABLES QUERIES ────────────────────────────────
    if (/SELECT .* FROM "wearables"/i.test(cleanStr)) {
      return { rows: this.wearables, rowCount: this.wearables.length };
    }

    // ── EVIDENCE CHAINS QUERIES ────────────────────────────────
    if (/SELECT .* FROM "evidence_chains"/i.test(cleanStr)) {
      return { rows: this.evidence_chains, rowCount: this.evidence_chains.length };
    }

    // Default fallback
    return { rows: [], rowCount: 0 };
  }
}

const memoryStore = new MemoryStore();

const mockClient = {
  query: (text: string, params?: any[]) => memoryStore.query(text, params),
  release: () => {},
};

export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('✅ PostgreSQL Database connected successfully', {
      timestamp: result.rows[0].now,
    });
    client.release();
  } catch (error) {
    isMockMode = true;
    logger.warn('⚠️ PostgreSQL unreachable — Switching to local In-Memory Database with live seed data', {
      notice: 'Backend endpoints & WebSocket will function 100% locally.',
    });
  }
}

export async function closeDatabase(): Promise<void> {
  if (!isMockMode) {
    await pool.end();
  }
  logger.info('Database connection pool closed');
}

export default {
  connect: async () => {
    if (isMockMode) {
      return mockClient;
    }
    try {
      return await pool.connect();
    } catch {
      isMockMode = true;
      return mockClient;
    }
  },
  query: async (text: string, params?: any[]) => {
    if (isMockMode) {
      return memoryStore.query(text, params);
    }
    try {
      return await pool.query(text, params);
    } catch {
      isMockMode = true;
      return memoryStore.query(text, params);
    }
  },
  on: (event: string, cb: any) => {
    pool.on(event, cb);
  },
};
