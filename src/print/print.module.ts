import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module';
import { WhateverModule } from '../whatever/whatever.module';
import configuration from './collect.configuration';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
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
  providers: [CollectService],
  controllers: [PrintNowController, PrintSoonController, CollectController],
})
export class PrintModule {}
