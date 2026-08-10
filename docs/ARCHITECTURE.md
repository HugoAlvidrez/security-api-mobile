# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                       │
│           (Usuario final - Cliente de wearable)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP + WebSocket
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌─────────────────┐
│  Nginx/Load      │            │   Next.js Web   │
│  Balancer        │            │   Dashboard     │
└────────┬─────────┘            └─────────────────┘
         │
         │ HTTPS + WSS
         │
    ┌────▼─────────────────────────────────────────────┐
    │                                                   │
    │    Express.js + TypeScript Backend API           │
    │                                                   │
    │  ┌────────────────────────────────────────────┐  │
    │  │          REST Endpoints                    │  │
    │  │  • Authentication (JWT)                    │  │
    │  │  • Wearable Management                     │  │
    │  │  • Emergency Events                        │  │
    │  │  • Chat & Messaging                        │  │
    │  │  • Notes Management                        │  │
    │  │  • Calendar & Reminders                    │  │
    │  │  • Evidence & Custody Chain                │  │
    │  └────────────────────────────────────────────┘  │
    │                                                   │
    │  ┌────────────────────────────────────────────┐  │
    │  │       WebSocket (Socket.io)                │  │
    │  │  • Real-time Notifications                 │  │
    │  │  • Live Event Streaming                    │  │
    │  │  • Chat Messages                           │  │
    │  │  • Stress Analysis Updates                 │  │
    │  └────────────────────────────────────────────┘  │
    │                                                   │
    │  ┌────────────────────────────────────────────┐  │
    │  │       Services Layer                       │  │
    │  │  • AuthService (JWT + Refresh tokens)     │  │
    │  │  • StressAnalysisService (AI/Mock)        │  │
    │  │  • StorageService (Local/Cloudinary)      │  │
    │  │  • NotificationService                    │  │
    │  └────────────────────────────────────────────┘  │
    │                                                   │
    └────┬──────────────────────────────┬──────────────┘
         │                              │
         │                              │
    ┌────▼──────────────┐       ┌───────▼────────┐
    │   PostgreSQL      │       │  File Storage  │
    │   Database        │       │  (Local/S3)    │
    │                   │       │                │
    │ • Users           │       │ • Audio files  │
    │ • Wearables       │       │ • Video files  │
    │ • Events          │       │ • Watermarks   │
    │ • Chat            │       │                │
    │ • Evidence Chain  │       └────────────────┘
    │ • Stress Data     │
    └───────────────────┘
```

## Component Layers

### 1. **Presentation Layer** (Controllers)
- Manejan solicitudes HTTP
- Validan entrada
- Formatan respuestas
- Delegación a servicios

Controllers:
- `AuthController` - Autenticación y perfil
- `WearableController` - Gestión de dispositivos
- `EventController` - Eventos de emergencia
- `ChatController` - Mensajería
- `NoteController` - Notas personales
- `CalendarController` - Citas
- `EvidenceController` - Evidencia y custodia

### 2. **Business Logic Layer** (Services)
- Lógica de negocio
- Procesamiento de datos
- Integraciones externas

Services:
- `AuthService` - Registro, login, tokens
- `StressAnalysisService` - Análisis de voz (AI/Mock)
- `StorageService` - Gestión de archivos
- `NotificationService` - Notificaciones

### 3. **Data Access Layer** (Database)
- Operaciones CRUD
- Queries PostgreSQL
- Connection pooling

Entidades:
- `users` - Usuarios del sistema
- `wearables` - Dispositivos emparejados
- `emergency_events` - Eventos de emergencia
- `chat_messages` - Mensajes de chat
- `personal_notes` - Notas del usuario
- `calendar_events` - Citas
- `stress_analyses` - Análisis de estrés
- `evidence_chains` - Cadena de custodia

### 4. **Integration Layer**
- WebSocket (Socket.io)
- Almacenamiento externo (S3/Cloudinary)
- Servicios de IA (OpenAI Whisper - Mock)

## Data Flow

### Ejemplo: Crear Evento de Emergencia

```
1. Cliente móvil envía solicitud:
   POST /api/events
   {
     "wearableId": "...",
     "eventType": "emergency",
     "location": {...}
   }

2. Express.js recibe y valida:
   - Valida token JWT
   - Valida datos con Zod
   - Verifica permisos del usuario

3. EventController procesa:
   - Extrae datos del request
   - Llama EventService

4. EventService (lógica):
   - Verifica wearable ownership
   - Genera evento con UUID
   - Guarda en base de datos

5. Base de datos (PostgreSQL):
   - INSERT en tabla emergency_events
   - Retorna registro insertado

6. WebSocket notifica:
   - Emite evento a usuarios conectados
   - Notifica a agentes en tiempo real

7. Respuesta al cliente:
   {
     "success": true,
     "message": "Event created successfully",
     "data": { /* evento creado */ }
   }
```

## Security Architecture

### Autenticación (JWT)

```
1. Usuario se autentica con email/password
2. Backend valida credenciales
3. Genera dos tokens:
   - Access Token (15 min) - Para requests
   - Refresh Token (7 días) - Para renovar access
4. Cliente almacena tokens de forma segura
5. Cada request incluye: Authorization: Bearer <token>
6. Backend valida firma y expiración
```

### Rate Limiting

```
- Máximo 100 requests por minuto por IP
- Protege contra ataques de fuerza bruta
- Implementado en middleware Express
```

### Protección de Evidencia

```
- Hash SHA-256 para integridad
- Flag "protected" previene descarga/edición
- Registro de acceso (descargas)
- Watermark opcional
- Cadena de custodia inmutable
```

## Real-time Features (WebSocket)

### Evento de Emergencia:
```javascript
// Cliente se suscribe al evento
socket.emit('event:subscribe', 'event-123');

// Servidor notifica actualizaciones
io.to('event:123').emit('event:updated', {
  status: 'in_progress',
  stressLevel: 85,
  timestamp: new Date()
});
```

### Chat en Tiempo Real:
```javascript
// Cliente envía mensaje
socket.emit('chat:message', {
  eventId: 'event-123',
  message: 'Hola agente'
});

// Todos los suscriptores reciben
socket.on('chat:new_message', (data) => {
  // Actualizar UI
});
```

### Notificaciones:
```javascript
// Notificación personalizada
socket.to('user:user-123').emit('notification', {
  type: 'event_created',
  eventId: 'event-123',
  message: 'Nuevo evento de emergencia'
});
```

## Escalabilidad

### Horizontal Scaling:

```
┌─────────────┐
│   Nginx     │  Load Balancer
└─────┬───────┘
      │
    ┌─┴─┬────────┬────────┐
    │   │        │        │
    ▼   ▼        ▼        ▼
  API1 API2   API3      API4
   │    │      │         │
   └────┴──────┴─────┬───┘
                     │
               PostgreSQL
```

### Caching:
- Redis para sesiones
- Cache de perfil de usuario
- Cache de eventos

### Database Optimization:
- Índices en campos frecuentemente consultados
- Particionamiento de tablas large
- Connection pooling (20 conexiones)

## Monitoring & Logging

### Winston Logger:
- Error log: `logs/error.log`
- Combined log: `logs/combined.log`
- Rotación automática (5MB por archivo)

### Métricas:
- Time to First Byte (TTFB)
- Requests per second
- Database query time
- WebSocket connections activas

## Deployment Options

### Development:
```bash
npm run dev  # On port 3001
```

### Docker:
```bash
docker-compose up -d  # All services + PostgreSQL
```

### Production (VPS):
```bash
pm2 start dist/server.js  # Process manager
Nginx reverse proxy
SSL/TLS with Let's Encrypt
PostgreSQL dedicated instance
```

---

Última actualización: Enero 2024
