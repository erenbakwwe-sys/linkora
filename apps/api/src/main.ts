import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getJwtRefreshSecret, getJwtSecret } from './common/security/secrets.js';
import { runWithDbContext } from './common/services/request-context.js';

let cachedServer: any = null;

function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000';
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function configureApp(app: INestApplication) {
  // Fail fast if secrets are missing/weak in production
  getJwtSecret();
  getJwtRefreshSecret();

  // Every request gets its own database context (tenant is filled in by the auth guard)
  app.use((_req: any, _res: any, next: () => void) => runWithDbContext(() => next()));

  app.use(helmet());

  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    // Same-origin requests (no Origin header, e.g. via Next.js/Vercel rewrites) are always allowed.
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
      return cb(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Linkora Platform API')
      .setDescription('Unified Lead Bank + AI Call-Center Platform API (v1)')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
}

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, { rawBody: true });
    configureApp(app);
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// Serverless Handler for Vercel
export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}

// Standalone Server for local dev & containers
if (!process.env.VERCEL) {
  (async () => {
    try {
      const app = await NestFactory.create(AppModule, { rawBody: true });
      configureApp(app);
      const port = process.env.PORT || process.env.API_PORT || 3001;
      await app.listen(port);
      console.log(`Linkora API listening on port ${port}`);
    } catch (err) {
      console.error('Error starting standalone server:', err);
      process.exitCode = 1;
    }
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
