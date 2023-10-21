import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhateverModule } from 'src/whatever/whatever.module';
import { CallbackQueueConsumer } from './callback-queue.consumer';
import { PrinterQueueConsumer } from './printer-queue.consumer';
import { PrinterQueueService } from './printer-queue.service';
import configuration from './queue.configuration';

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
  providers: [PrinterQueueService, PrinterQueueConsumer, CallbackQueueConsumer],
  exports: [PrinterQueueService],
})
export class QueueModule {}
