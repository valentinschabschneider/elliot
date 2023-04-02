import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { Queue } from 'bull';

import { AppModule } from './app.module';

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

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Elliot example')
      .setDescription('The elliot API description')
      .setVersion(process.env.npm_package_version)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // -----------------

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');
    createBullBoard({
      queues: [new BullMQAdapter(app.get<Queue>(`BullQueue_print`))],
      serverAdapter,
    });
    app.use('/bull-board', serverAdapter.getRouter());
  }

  app.use(bodyParser.text({ type: 'text/html' }));

  await app.listen(parseInt(process.env.PORT, 10) || 3000);
}
bootstrap();
