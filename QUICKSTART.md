# ⚡ Quick Start Guide

Guía rápida para iniciar el backend SecurityIA Fem en 5 minutos.

## 1️⃣ Instalación (1 minuto)

```bash
cd c:\Users\anime\Desktop\Proyecto\ InnovaTec\security-api-mobile
npm install
```

## 2️⃣ Configuración (1 minuto)

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (opcional para desarrollo)
# Por defecto usa localhost:5432 como DB
```

## 3️⃣ Base de Datos (2 minutos)

```bash
# Crear base de datos
createdb security_ia_db

# Ejecutar migraciones
for file in migrations/*.sql; do 
  psql security_ia_db < "$file"
done

# O una por una
psql security_ia_db < migrations/001_create_users.sql
psql security_ia_db < migrations/002_create_wearables.sql
# ... etc
```

## 4️⃣ Iniciar Servidor (1 minuto)

```bash
npm run dev
```

El servidor estará en: **http://localhost:3001**

## ✅ Verificar que Funcione

```bash
# Test de health check
curl http://localhost:3001/health

# Debe retornar:
{
  "success": true,
  "message": "Server is running",
  ...
}
```

## 📚 Acceder a Documentación

- **Swagger UI**: http://localhost:3001/api-docs
- **README**: Abre `README.md` en el proyecto
- **Architecture**: Abre `docs/ARCHITECTURE.md`

## 🧪 Probar Endpoints Básicos

### Registrar Usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "fullName": "John Doe"
  }'
```

Guardar el token del response.

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Obtener Perfil

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 🐳 Alternativa: Docker

Si tienes Docker instalado:

```bash
docker-compose up -d
```

Esto levanta:
- PostgreSQL en puerto 5432
- API en puerto 3001
- Adminer (DB UI) en puerto 8080

## 📖 Flujo Completo de Prueba

1. Registrarse: `/api/auth/register`
2. Login: `/api/auth/login`
3. Emparejar wearable: `POST /api/wearables/pair`
4. Crear evento: `POST /api/events`
5. Enviar mensaje: `POST /api/chat/send`
6. Crear nota: `POST /api/notes`

Ver `docs/TESTING.md` para ejemplos completos.

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar desde build
npm start

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run format

# Type checking
npm run type-check
```

## ⚙️ Variables de Entorno Principales

```env
# Puerto del servidor
PORT=3001

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=security_ia_db
DB_USER=postgres
DB_PASSWORD=password

# JWT (cambiar en producción)
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Otros
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## 🔍 Troubleshooting

### Error: "Database connection refused"
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# En Windows: Services > PostgreSQL
```

### Error: "Port 3001 already in use"
```bash
# Encontrar proceso usando el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📱 Para Integración con Flutter

Usar estos endpoints desde tu app:

```dart
const API_URL = 'http://tu-servidor:3001/api';
const WS_URL = 'http://tu-servidor:3001';

// Ejemplo login
final response = await http.post(
  Uri.parse('$API_URL/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({'email': email, 'password': password}),
);

// Ejemplo WebSocket
final socket = IO.io(WS_URL, 
  IO.OptionBuilder().setAuth({'token': token}).build());
```

## 📞 Recursos Adicionales

- **README.md** - Documentación completa
- **docs/ARCHITECTURE.md** - Cómo está construido
- **docs/DEPLOYMENT.md** - Cómo deployar a producción
- **docs/TESTING.md** - Cómo testear la API
- **SUMMARY.md** - Resumen ejecutivo

## 🎉 ¡Listo!

Ahora tienes un backend completamente funcional y listo para:
- ✅ Desarrollo local
- ✅ Testing
- ✅ Integración con Flutter
- ✅ Deployment en producción

¿Preguntas? Revisa la documentación o crea un issue.

**¡A desarrollar!** 🚀
