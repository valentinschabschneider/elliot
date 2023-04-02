import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { WhateverModule } from 'src/whatever/whatever.module';
import { PrintQueueService } from './print-queue.service';
import { QueueConsumer } from './queue.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'print',
    }),
    WhateverModule,
  ],
  providers: [PrintQueueService, QueueConsumer],
  exports: [PrintQueueService],
})
export class QueueModule {}
