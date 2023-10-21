import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhateverModule } from 'src/whatever/whatever.module';
import { CallbackQueueConsumer } from './callback-queue.consumer';
import { PrintQueueService } from './print-queue.service';
import configuration from './queue.configuration';
import { QueueConsumer } from './queue.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'printer',
    }),
    BullModule.registerQueue({
      name: 'callbacker',
    }),
    WhateverModule,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    HttpModule,
  ],
  providers: [PrintQueueService, QueueConsumer, CallbackQueueConsumer],
  exports: [PrintQueueService],
})
export class QueueModule {}
