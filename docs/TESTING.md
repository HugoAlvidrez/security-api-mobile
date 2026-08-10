# API Testing Guide

## Postman Collection

Importa esta colección en Postman para probar todos los endpoints.

### Variables globales

```json
{
  "baseUrl": "http://localhost:3001/api",
  "accessToken": "",
  "refreshToken": "",
  "userId": "",
  "wearableId": "",
  "eventId": "",
  "noteId": ""
}
```

## Flujo de prueba completo

### 1. Registrar usuario

```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "confirmPassword": "TestPassword123!",
  "fullName": "Test User",
  "phoneNumber": "+34612345678"
}
```

Guardar `userId` y `accessToken` en variables globales.

### 2. Login

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

### 3. Obtener perfil

```
GET {{baseUrl}}/auth/profile
Authorization: Bearer {{accessToken}}
```

### 4. Emparejar wearable

```
POST {{baseUrl}}/wearables/pair
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "deviceId": "DEV-001",
  "deviceName": "Mi Smartwatch",
  "deviceType": "smartwatch",
  "pairingCode": "1234"
}
```

Guardar `wearableId` en variables.

### 5. Crear evento de emergencia

```
POST {{baseUrl}}/events
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "wearableId": "{{wearableId}}",
  "eventType": "emergency",
  "description": "Evento de prueba",
  "location": {
    "latitude": 40.4168,
    "longitude": -3.7038
  }
}
```

Guardar `eventId`.

### 6. Enviar mensaje de chat

```
POST {{baseUrl}}/chat/send
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "eventId": "{{eventId}}",
  "message": "Hola, necesito ayuda"
}
```

### 7. Obtener historial de chat

```
GET {{baseUrl}}/chat/{{eventId}}
Authorization: Bearer {{accessToken}}
```

### 8. Crear nota

```
POST {{baseUrl}}/notes
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Mi primera nota",
  "content": "Esta es una nota de prueba",
  "category": "personal",
  "isPinned": false
}
```

### 9. Crear evento de calendario

```
POST {{baseUrl}}/calendar
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Cita con agente",
  "description": "Seguimiento de evento",
  "startTime": "2024-02-15T10:00:00Z",
  "endTime": "2024-02-15T10:30:00Z",
  "reminder": true,
  "reminderMinutes": 15
}
```

### 10. Subir evidencia

```
POST {{baseUrl}}/evidence/upload
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

file: [audio.mp3 o video.mp4]
eventId: {{eventId}}
fileType: audio (o video)
```

### 11. Análisis de estrés

```
POST {{baseUrl}}/stress-analysis
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "eventId": "{{eventId}}",
  "userId": "{{userId}}",
  "audioUrl": "https://example.com/audio.mp3"
}
```

## Tests cURL

```bash
#!/bin/bash

# Variables
API="http://localhost:3001/api"
EMAIL="test@example.com"
PASSWORD="TestPassword123!"

# 1. Registrar
echo "Registrando usuario..."
RESPONSE=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "confirmPassword": "'$PASSWORD'",
    "fullName": "Test User"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.data.tokens.accessToken')
USER_ID=$(echo $RESPONSE | jq -r '.data.user.id')

echo "Token: $TOKEN"
echo "User ID: $USER_ID"

# 2. Login
echo -e "\nLogin..."
curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}' | jq .

# 3. Obtener perfil
echo -e "\nObtener perfil..."
curl -s -X GET $API/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Emparejar wearable
echo -e "\nEmparejar wearable..."
curl -s -X POST $API/wearables/pair \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV-001",
    "deviceName": "Smartwatch",
    "deviceType": "smartwatch",
    "pairingCode": "1234"
  }' | jq .

# 5. Obtener wearables
echo -e "\nObtener wearables..."
curl -s -X GET $API/wearables \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## WebSocket Testing

### Node.js

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_access_token'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('event:subscribe', 'event-uuid');
});

socket.on('chat:new_message', (data) => {
  console.log('New message:', data);
});

socket.on('notification', (data) => {
  console.log('Notification:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Python

```python
import socketio
import json

sio = socketio.Client()

@sio.event
def connect():
    print('Connected!')
    sio.emit('event:subscribe', 'event-uuid')

@sio.on('chat:new_message')
def on_message(data):
    print('New message:', data)

@sio.on('notification')
def on_notification(data):
    print('Notification:', data)

@sio.event
def disconnect():
    print('Disconnected')

# Conectar con autenticación
sio.connect('http://localhost:3001',
            auth={'token': 'your_access_token'})

# Mantener conexión abierta
sio.wait()
```

---

Última actualización: Enero 2024
