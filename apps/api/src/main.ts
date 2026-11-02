import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer: any = null;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

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
      const app = await NestFactory.create(AppModule);
      app.enableCors({ origin: '*', credentials: true });
      app.setGlobalPrefix('api');
      const port = process.env.PORT || process.env.API_PORT || 3001;
      await app.listen(port);
      console.log(`Linkora API listening on port ${port}`);
    } catch (err) {
      console.error('Error starting standalone server:', err);
    }
  })();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
