import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { get } from 'env-var';
import * as basicAuth from 'express-basic-auth';
import { AuthModule } from './auth/auth.module';
import { PagedjsModule } from './pagedjs/pagedjs.module';
import { PreviewModule } from './preview/preview.module';
import { PrintModule } from './print/print.module';
import { QueueModule } from './queue/queue.module';
import { WhateverModule } from './whatever/whatever.module';

@Module({
  imports: [
    AuthModule,
    PrintModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules/pagedjs-cli/dist'),
      serveRoot: '/static/pagedjs',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
      serveRoot: '/static',
    }),
    PreviewModule,
    PagedjsModule,
    BullModule.forRoot({
      url: get('REDIS_URL') ? get('REDIS_URL').asUrlString() : null,
    }),
    BullBoardModule.forRoot({
      route: '/bull-board',
      adapter: ExpressAdapter,
      middleware: basicAuth({
        challenge: true,
        users: { admin: get('BULL_BOARD_PASSWORD').asString() },
      }),
    }),
    QueueModule,
    WhateverModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
