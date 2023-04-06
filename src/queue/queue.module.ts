import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhateverModule } from 'src/whatever/whatever.module';
import { PrintQueueService } from './print-queue.service';
import configuration from './queue.configuration';
import { QueueConsumer } from './queue.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'printer',
    }),
    WhateverModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [PrintQueueService, QueueConsumer],
  exports: [PrintQueueService],
})
export class QueueModule {}
