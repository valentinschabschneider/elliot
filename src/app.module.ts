import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { get } from 'env-var';
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
      redis: {
        host: get('REDIS_URL').required().asUrlObject().hostname,
        password: get('REDIS_URL').required().asUrlObject().password,
        port: Number(get('REDIS_URL').required().asUrlObject().port),
        username: get('REDIS_URL').required().asUrlObject().username,
      }, // TODO: better?
    }),
    QueueModule,
    WhateverModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
