# SecurityIA Fem - Mobile Backend API

Backend API para la aplicación móvil SecurityIA Fem, construido con Node.js, Express, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Gestión de wearables** - Emparejamiento y sincronización de dispositivos
- **Eventos de emergencia** - Registro automático con audio/video
- **Análisis de estrés con IA** - Detecta nivel de estrés en voz en tiempo real
- **Chat en tiempo real** - Comunicación entre cliente y agente ciudadano
- **Notas personales** - Guardar y organizar notas
- **Calendario** - Citas y recordatorios con agentes
- **Cadena de custodia** - Registro inmutable de evidencia
- **WebSocket** - Notificaciones en tiempo real
- **Rate limiting** - Protección contra abuso
- **Validación exhaustiva** - Con Zod
- **Documentación Swagger** - API docs interactiva

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 12
- Git

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd security-api-mobile
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```env
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=security_ia_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Storage
STORAGE_TYPE=local
STORAGE_PATH=./uploads
```

### 4. Crear base de datos

```bash
createdb security_ia_db
```

### 5. Ejecutar migraciones

```bash
psql security_ia_db < migrations/001_create_users.sql
psql security_ia_db < migrations/002_create_wearables.sql
psql security_ia_db < migrations/003_create_events.sql
psql security_ia_db < migrations/004_create_chat.sql
psql security_ia_db < migrations/005_create_notes.sql
psql security_ia_db < migrations/006_create_calendar.sql
psql security_ia_db < migrations/007_create_stress_analyses.sql
psql security_ia_db < migrations/008_create_evidence_chains.sql
```

O ejecutar todas las migraciones a la vez:

```bash
for file in migrations/*.sql; do psql security_ia_db < "$file"; done
```

## 🏃 Ejecutar la aplicación

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Producción

```bash
npm run build
npm start
```

## 📚 API Documentation

### Swagger UI

Acceder a la documentación interactiva en: `http://localhost:3001/api-docs`

### Health Check

```bash
GET /health
```

Verifica que el servidor esté en funcionamiento.

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren un token JWT.

### Header requerido

```
Authorization: Bearer <your_access_token>
```

### Obtener tokens

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "cliente"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Refresh Token

```bash
POST /api/auth/refresh
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/auth/login` | Login de usuario | ❌ |
| POST | `/api/auth/refresh` | Refrescar token de acceso | ✅ |
| GET | `/api/auth/profile` | Obtener perfil del usuario | ✅ |
| PUT | `/api/auth/profile` | Actualizar perfil | ✅ |

### Wearables

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/wearables/pair` | Emparejar dispositivo | ✅ |
| GET | `/api/wearables` | Obtener todos los wearables | ✅ |
| GET | `/api/wearables/:id` | Obtener wearable por ID | ✅ |
| PUT | `/api/wearables/:id` | Actualizar wearable | ✅ |
| DELETE | `/api/wearables/:id` | Eliminar wearable | ✅ |

### Eventos de Emergencia

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/events` | Crear evento de emergencia | ✅ |
| GET | `/api/events` | Obtener eventos del usuario | ✅ |
| GET | `/api/events/:id` | Obtener evento por ID | ✅ |
| PUT | `/api/events/:id` | Actualizar evento | ✅ |

### Chat

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/chat/send` | Enviar mensaje | ✅ |
| GET | `/api/chat/:eventId` | Obtener historial de chat | ✅ |
| PATCH | `/api/chat/:eventId/read` | Marcar mensajes como leído | ✅ |

### Notas Personales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/notes` | Crear nota | ✅ |
| GET | `/api/notes` | Obtener notas del usuario | ✅ |
| GET | `/api/notes/:id` | Obtener nota por ID | ✅ |
| PUT | `/api/notes/:id` | Actualizar nota | ✅ |
| DELETE | `/api/notes/:id` | Eliminar nota | ✅ |

### Calendario

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/calendar` | Crear evento de calendario | ✅ |
| GET | `/api/calendar` | Obtener eventos próximos | ✅ |
| GET | `/api/calendar/:id` | Obtener evento por ID | ✅ |
| PUT | `/api/calendar/:id` | Actualizar evento | ✅ |
| DELETE | `/api/calendar/:id` | Eliminar evento | ✅ |

### Evidencia

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/evidence/upload` | Subir audio/video | ✅ |
| GET | `/api/evidence/:eventId` | Obtener medios del evento | ✅ |
| GET | `/api/evidence/:eventId/chain` | Obtener cadena de custodia | ✅ |
| POST | `/api/evidence/:chainId/verify` | Verificar integridad | ✅ |

### Análisis de Estrés

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/stress-analysis` | Analizar nivel de estrés | ✅ |

## 🔌 WebSocket

### Conectarse

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Conexión exitosa
socket.on('connect', () => {
  console.log('Connected');
});
```

### Eventos disponibles

#### Suscribirse a evento

```javascript
socket.emit('event:subscribe', 'event-id');
```

#### Enviar mensaje de chat

```javascript
socket.emit('chat:message', {
  eventId: 'event-id',
  message: 'Hola agente'
});

// Escuchar nuevos mensajes
socket.on('chat:new_message', (data) => {
  console.log('New message:', data);
});
```

#### Actualizar nivel de estrés

```javascript
socket.emit('stress:update', {
  eventId: 'event-id',
  level: 85
});

// Escuchar actualizaciones
socket.on('stress:updated', (data) => {
  console.log('Stress updated:', data);
});
```

#### Recibir notificaciones

```javascript
socket.on('notification', (notification) => {
  // notification.type: 'event_created' | 'event_updated' | 'chat_message'
  console.log('Notification:', notification);
});
```

## 🧪 Testing

### Ejecutar tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

## 📝 Ejemplos de uso

### Registrar usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "fullName": "Juan Pérez",
    "phoneNumber": "+34612345678"
  }'
```

### Emparejar wearable

```bash
curl -X POST http://localhost:3001/api/wearables/pair \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-123",
    "deviceName": "Mi Smartwatch",
    "deviceType": "smartwatch",
    "pairingCode": "1234"
  }'
```

### Crear evento de emergencia

```bash
curl -X POST http://localhost:3001/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "wearableId": "wearable-uuid",
    "eventType": "emergency",
    "description": "Caída detectada",
    "location": {
      "latitude": 40.4168,
      "longitude": -3.7038
    }
  }'
```

### Subir evidencia (audio/video)

```bash
curl -X POST http://localhost:3001/api/evidence/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@./audio.mp3" \
  -F "eventId=event-uuid" \
  -F "fileType=audio"
```

### Enviar mensaje de chat

```bash
curl -X POST http://localhost:3001/api/chat/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-uuid",
    "message": "Hola, necesito ayuda"
  }'
```

## 🛠️ Scripts disponibles

```bash
npm run dev              # Iniciar en modo desarrollo
npm run build            # Compilar TypeScript
npm start                # Iniciar servidor compilado
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Reporte de cobertura
npm run lint             # Ejecutar linter
npm run format           # Formatear código
npm run type-check       # Verificar tipos TypeScript
npm run migrate          # Ejecutar migraciones
```

## 📊 Estructura del proyecto

```
src/
├── server.ts                 # Servidor principal
├── config/
│   ├── env.ts              # Variables de entorno
│   ├── database.ts         # Configuración PostgreSQL
│   └── logger.ts           # Winston logger
├── middleware/
│   ├── auth.ts             # JWT authentication
│   ├── errorHandler.ts     # Error handling
│   └── validation.ts       # Zod validation
├── controllers/
│   ├── authController.ts
│   ├── wearableController.ts
│   ├── eventController.ts
│   ├── chatController.ts
│   ├── noteController.ts
│   ├── calendarController.ts
│   └── evidenceController.ts
├── services/
│   ├── authService.ts
│   ├── stressAnalysisService.ts
│   ├── storageService.ts
│   └── notificationService.ts
├── routes/
│   ├── auth.ts
│   ├── wearables.ts
│   ├── events.ts
│   ├── chat.ts
│   ├── notes.ts
│   ├── calendar.ts
│   └── evidence.ts
├── types/
│   └── index.ts            # TypeScript types
├── utils/
│   ├── jwt.ts              # JWT utilities
│   └── validators.ts       # Zod schemas
└── websocket/
    └── events.ts           # Socket.io setup

migrations/                  # SQL migrations
tests/                      # Jest tests
docs/                       # Documentación
```

## 🔒 Seguridad

- ✅ Autenticación JWT con tokens que expiran en 15 minutos
- ✅ Refresh tokens que expiran en 7 días
- ✅ Rate limiting: máximo 100 requests por minuto por IP
- ✅ Validación exhaustiva de inputs con Zod
- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ Protección de evidencia contra descarga/edición
- ✅ Cadena de custodia inmutable
- ✅ Hash de integridad SHA-256 para archivos
- ✅ Sanitización de inputs
- ✅ Logs detallados de acceso

## 📱 Integración con Flutter

### WebSocket Flutter

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

IO.Socket socket = IO.io('http://localhost:3001', IO.OptionBuilder()
    .setTransports(['websocket'])
    .setAuth({'token': accessToken})
    .build());

socket.onConnect((_) {
  print('connected');
  socket.emit('event:subscribe', eventId);
});

socket.on('notification', (data) {
  print('Notification: $data');
});

socket.on('chat:new_message', (data) {
  print('New message: $data');
});
```

### Llamadas HTTP Flutter

```dart
import 'package:http/http.dart' as http;

final response = await http.post(
  Uri.parse('http://localhost:3001/api/events'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $accessToken',
  },
  body: jsonEncode({
    'wearableId': wearableId,
    'eventType': 'emergency',
    'description': 'Evento de prueba',
  }),
);
```

## 🚀 Deployment

### Heroku

```bash
heroku create security-api-mobile
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

### Docker

```bash
docker build -t security-api-mobile .
docker run -p 3001:3001 --env-file .env security-api-mobile
```

## 📞 Soporte

Para reportar bugs o sugerencias, crear un issue en el repositorio.

## 📄 Licencia

MIT

## 👥 Autores

SecurityIA Team

---

**Último update**: Enero 2024
**Versión**: 1.0.0
