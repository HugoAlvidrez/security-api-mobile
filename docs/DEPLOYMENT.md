# Deployment Guide

Guía completa para desplegar SecurityIA Fem Mobile API en producción.

## 📋 Requisitos de Producción

- Ubuntu 20.04+ o similar
- Node.js 18+ LTS
- PostgreSQL 12+
- Nginx o Apache
- SSL/TLS certificate (Let's Encrypt)
- 2GB+ RAM
- 10GB+ almacenamiento

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=security_ia_db
      - DB_USER=postgres
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads
    restart: always

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=security_ia_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - api
    restart: always

volumes:
  postgres_data:
```

### nginx.conf

```nginx
upstream api {
    server api:3001;
}

server {
    listen 80;
    server_name api.securityiafem.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.securityiafem.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 500M;

    gzip on;
    gzip_types text/plain application/json;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    location /uploads {
        alias /app/uploads;
        expires 30d;
    }
}
```

## 🚀 Desplegar con Docker

```bash
# 1. Preparar variables de entorno
cp .env.example .env
# Editar .env con valores de producción

# 2. Generar certificados SSL
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/key.pem -out certs/cert.pem

# 3. Iniciar servicios
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f api

# 5. Ejecutar migraciones
docker-compose exec api npm run migrate
```

## 🖥️ Instalación manual en VPS

### 1. Preparar servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2
sudo npm install -g pm2

# Instalar Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configurar PostgreSQL

```bash
# Conectarse como usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE security_ia_db;
CREATE USER api_user WITH ENCRYPTED PASSWORD 'secure_password';
ALTER ROLE api_user SET client_encoding TO 'utf8';
ALTER ROLE api_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE api_user SET default_transaction_deferrable TO on;
ALTER ROLE api_user SET default_timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE security_ia_db TO api_user;
\q
```

### 3. Desplegar aplicación

```bash
# Crear directorio
sudo mkdir -p /var/www/security-api-mobile
cd /var/www/security-api-mobile

# Clonar repositorio
sudo git clone <repo-url> .

# Instalar dependencias
npm install

# Configurar variables de entorno
sudo cp .env.example .env
sudo nano .env  # Editar valores

# Compilar
npm run build

# Ejecutar migraciones
npm run migrate

# Iniciar con PM2
pm2 start dist/server.js --name "security-api"
pm2 startup
pm2 save
```

### 4. Configurar Nginx

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/security-api

# Contenido:
server {
    listen 80;
    server_name api.securityiafem.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/security-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL

```bash
# Generar certificado Let's Encrypt
sudo certbot certbot --nginx -d api.securityiafem.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

### 6. Configurar Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 📊 Monitoreo

### PM2 Monitoreo

```bash
# Dashboard en tiempo real
pm2 monit

# Logs
pm2 logs security-api

# Información del proceso
pm2 info security-api
```

### Nginx Logs

```bash
# Error log
sudo tail -f /var/log/nginx/error.log

# Access log
sudo tail -f /var/log/nginx/access.log
```

### Monitoreo de Base de Datos

```bash
sudo -u postgres psql

# Ver conexiones
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Ver uso de disco
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 CI/CD con GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
          
          ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST \
            'cd /var/www/security-api-mobile && \
             git pull && \
             npm install && \
             npm run build && \
             pm2 restart security-api'
```

## 🔐 Configuración de Seguridad en Producción

### Variables de entorno

```env
NODE_ENV=production
JWT_SECRET=<very_long_random_string>
JWT_REFRESH_SECRET=<very_long_random_string>
DB_PASSWORD=<strong_password>
CORS_ORIGIN=https://app.securityiafem.com,https://web.securityiafem.com
```

### Backup automático

```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump security_ia_db | \
  gzip > /backups/security_ia_db_$TIMESTAMP.sql.gz

# Mantener últimas 7 backups
find /backups -name "security_ia_db_*.sql.gz" -mtime +7 -delete
```

Agregar a crontab:
```bash
0 2 * * * /var/www/security-api-mobile/backup.sh
```

## 📈 Escalabilidad

### Load Balancing

Para alta carga, usar múltiples instancias:

```yaml
upstream api_backend {
    least_conn;
    server api1:3001;
    server api2:3001;
    server api3:3001;
}

server {
    location / {
        proxy_pass http://api_backend;
    }
}
```

### Caching con Redis

```javascript
import redis from 'redis';

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

// Cachear eventos del usuario
app.get('/api/events', async (req, res) => {
  const cacheKey = `events:${req.user.userId}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Fetch from DB
  const events = await getEvents(req.user.userId);
  await redisClient.setex(cacheKey, 300, JSON.stringify(events));
  
  res.json(events);
});
```

## 🆘 Troubleshooting

### Error: "Database connection refused"

```bash
# Verificar si PostgreSQL está corriendo
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar credenciales en .env
```

### Error: "Port 3001 already in use"

```bash
# Encontrar proceso en puerto 3001
sudo lsof -i :3001

# Matar proceso
sudo kill -9 <PID>
```

### Memory leak en Node.js

```bash
# Revisar memoria usada
pm2 monit

# Reiniciar aplicación
pm2 restart security-api

# Aumentar límite de memoria
pm2 start dist/server.js --name "security-api" --max-memory-restart 500M
```

---

Última actualización: Enero 2024
