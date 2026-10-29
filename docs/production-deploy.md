# Linkora Production Deployment Guide

> **Production Setup:** Docker Compose, Kubernetes, Reverse Proxy (Nginx/Traefik), SSL Certificates, Environment Configuration.

---

## 1. Environment Configuration (`.env.production`)

Ensure all production secrets are populated before startup:

```bash
# General
NODE_ENV=production
BRAND_NAME=Linkora
BASE_URL=https://linkora.io

# Database (PostgreSQL with RLS enabled)
DATABASE_URL=postgresql://linkora_admin:SecurePassword123@postgres.internal:5432/linkora_prod
DB_MAX_CONNECTIONS=50

# Redis (Queues & State)
REDIS_URL=redis://:RedisAuthPass@redis.internal:6379/0

# Object Storage (MinIO or AWS S3)
S3_ENDPOINT=s3.eu-central-1.amazonaws.com
S3_REGION=eu-central-1
S3_BUCKET=linkora-recordings-prod
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Telephony Provider (Telnyx / Twilio)
TELEPHONY_PROVIDER=telnyx
TELNYX_API_KEY=KEY017...
TELNYX_CONNECTION_ID=conn_123456
TELNYX_PUBLIC_KEY=pub_telnyx_...

# AI Provider (Google Gemini)
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-pro
```

---

## 2. Docker Compose Production Deployment

To run Linkora with pre-configured containers:

```bash
# 1. Clone repository & copy environment
cp .env.example .env.production

# 2. Build and launch services
docker compose -f docker-compose.prod.yml up -d --build

# 3. Execute database migrations & seed
docker compose exec api pnpm db:migrate
docker compose exec api pnpm db:seed
```

---

## 3. Reverse Proxy & SSL Configuration (Nginx Example)

```nginx
server {
    listen 443 ssl http2;
    server_name linkora.io www.linkora.io;

    ssl_certificate /etc/letsencrypt/live/linkora.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/linkora.io/privkey.pem;

    # Public Web & Next.js SSR
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # NestJS API Gateway & WebSockets
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```
