import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';

import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrinterQueueService } from './printer-queue.service';

@Processor({ name: 'callbacker' })
export class CallbackQueueConsumer {
  private readonly logger = new Logger(CallbackQueueConsumer.name);

  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly httpService: HttpService,
  ) {}

  @Process({ name: 'callback' })
  async transcode(job: Job<string>) {
    this.logger.log(`Process callback job ${job.data}`);

    const printJob = await this.printerQueueService.getPrintJob(job.data);

    this.logger.log(`Sending callback ${printJob.data.callbackUrl}`);

    const printJobStatus =
      await this.printerQueueService.getPrintJobStatus(printJob);

    await lastValueFrom(
      this.httpService.post(
        printJob.data.callbackUrl,
        { jobId: printJob.id, ...printJobStatus },
        {
          headers: printJob.data.httpHeaders,
        },
      ),
    );
  }

  @OnQueueCompleted({ name: 'callback' })
  completedHandler(job: Job) {
    this.logger.log(`Sucessfully sent callback ${job.data}`);
  }

  @OnQueueFailed({ name: 'callback' })
  failedHandler(job: Job, e: Error) {
    this.logger.error(`Failed to send callback ${job.data}`, e);
  }
}
