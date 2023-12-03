import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module';
import { WhateverModule } from '../whatever/whatever.module';
import configuration from './collect.configuration';
import { CollectService } from './collect.service';
import { PrintNowController } from './print-now.controller';
import { PrintSoonController } from './print-soon.controller';

@Module({
  imports: [
    QueueModule,
    WhateverModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [CollectService],
  controllers: [PrintNowController, PrintSoonController],
})
export class PrintModule {}
