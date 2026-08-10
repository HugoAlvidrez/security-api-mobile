import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import pool from '../config/database.js';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create demo users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@securityiafem.com',
        password: 'Admin123!',
        fullName: 'Valentina Torres',
        role: 'super_admin',
      },
      {
        id: uuidv4(),
        email: 'operador@securityiafem.com',
        password: 'Oper123!',
        fullName: 'Mariana López',
        role: 'operador',
      },
      {
        id: uuidv4(),
        email: 'cliente1@securityiafem.com',
        password: 'Cliente123!',
        fullName: 'Ana García',
        role: 'cliente',
      },
    ];

    for (const user of users) {
      const hashed = await bcryptjs.hash(user.password, 12);
      await client.query(
        `INSERT INTO "users" (id, email, "passwordHash", "fullName", role, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, hashed, user.fullName, user.role]
      );
    }

    // Demo wearables
    const wearableId = uuidv4();
    await client.query(
      `INSERT INTO "wearables" (id, "userId", "deviceId", "deviceName", "deviceType", "isPaired", "batteryLevel", "lastConnected", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, true, 88, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [wearableId, users[2].id, 'WBL-1001', 'Security Wearable', 'wristband']
    );

    // Demo events
    const eventIds = [uuidv4(), uuidv4()];
    await client.query(
      `INSERT INTO "emergency_events" (id, "userId", "wearableId", "eventType", status, description, "location", "stressLevel", "audioUrl", "videoUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        eventIds[0],
        users[2].id,
        wearableId,
        'emergency',
        'active',
        'Botón de emergencia presionado desde wearable',
        JSON.stringify({ latitude: 19.432608, longitude: -99.133209 }),
        0.84,
        'https://storage.googleapis.com/demo-media/security_audio_sample.mp3',
        'https://storage.googleapis.com/demo-media/security_video_sample.mp4',
      ]
    );

    await client.query(
      `INSERT INTO "emergency_events" (id, "userId", "wearableId", "eventType", status, description, "location", "stressLevel", "audioUrl", "videoUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        eventIds[1],
        users[2].id,
        wearableId,
        'emergency',
        'resolved',
        'Falsa alarma verificada con cliente',
        JSON.stringify({ latitude: 20.673615, longitude: -103.343178 }),
        0.42,
        'https://storage.googleapis.com/demo-media/security_audio_sample.mp3',
        'https://storage.googleapis.com/demo-media/security_video_sample.mp4',
      ]
    );

    // Demo chat
    await client.query(
      `INSERT INTO "chat_messages" (id, "eventId", "senderId", "senderRole", message, "isRead", "createdAt")
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuidv4(), eventIds[0], users[2].id, 'cliente', '¡Ayuda, por favor! Estoy en peligro.', false]
    );

    await client.query(
      `INSERT INTO "chat_messages" (id, "eventId", "senderId", "senderRole", message, "isRead", "createdAt")
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuidv4(), eventIds[0], users[1].id, 'operador', 'Entendido, estamos enviando apoyo ahora mismo.', true]
    );

    await client.query('COMMIT');

    console.log('✅ Demo seed data inserted successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Demo seed failed', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
