import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { Queue } from 'bull';

import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('AuthConfiguration');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
    rawBody: true,
  });

  if (process.env.ENABLE_DASHBOARDS === 'true') {
    if (process.env.NODE_ENV === 'production')
      logger.warn('Dashboards are enabled in production!');

    const config = new DocumentBuilder()
      .setTitle('Elliot example')
      .setDescription('The elliot API description')
      .setVersion(process.env.npm_package_version)
      .addApiKey({ type: 'apiKey', name: 'api-key', in: 'header' }, 'Api key')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // -----------------

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');
    createBullBoard({
      queues: [new BullMQAdapter(app.get<Queue>(`BullQueue_printer`))],
      serverAdapter,
    });
    app.use('/bull-board', serverAdapter.getRouter());
  }

  app.use(bodyParser.text({ type: 'text/html' }));

  if (process.env.REDIS_URL === undefined)
    logger.warn('No redis configured! Print soon feature unavailable.');

  await app.listen(parseInt(process.env.PORT, 10) || 3000);
}
bootstrap();
