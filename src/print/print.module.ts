import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@nestjs/config';
import { WhateverModule } from 'src/whatever/whatever.module';
import { QueueModule } from '../queue/queue.module';
import configuration from './collect.configuration';
import { CollectController } from './collect.controller';
import { PrintNowController } from './print-now.controller';
import { PrintSoonController } from './print-soon.controller';

@Module({
  imports: [
    JwtModule,
    QueueModule,
    WhateverModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [PrintNowController, PrintSoonController, CollectController],
})
export class PrintModule {}
