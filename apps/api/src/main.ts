import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: any = null;

async function createNestApp(expressInstance?: any) {
  const adapter = expressInstance ? new ExpressAdapter(expressInstance) : undefined;
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Linkora Platform API')
    .setDescription('Unified Lead Bank + AI Call-Center Platform API (v1)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app;
}

// Serverless Handler for Vercel
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    const expressApp = express();
    const app = await createNestApp(expressApp);
    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp(req, res);
}

// Standalone Server for local dev & containers
if (!process.env.VERCEL) {
  (async () => {
    try {
      const app = await createNestApp();
      const port = process.env.PORT || process.env.API_PORT || 3001;
      await app.listen(port);
      console.log(`Linkora API listening on port ${port}`);
      console.log(`Swagger documentation available at http://localhost:${port}/docs`);
    } catch (err) {
      console.error('Error starting standalone server:', err);
    }
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
