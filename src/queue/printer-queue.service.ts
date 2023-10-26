import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { v4 as uuid } from 'uuid';

import { PrintOptions } from '../whatever/print-options.interface'; // TODO: mabye put somewhere else
import { PrintStatus } from './print-status.interface';

@Injectable()
export class PrinterQueueService {
  private readonly logger = new Logger(PrinterQueueService.name);

  constructor(
    @InjectQueue('printer') private printerQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  public async addPrintJob(
    options: PrintOptions,
    priority: number,
  ): Promise<Job> {
    const job = await this.printerQueue.add('print', options, {
      jobId: uuid(),
      priority,
      attempts: 1,
    });

    return job;
  }

  public async getPrintJob(id: string): Promise<Job> {
    const job = await this.printerQueue.getJob(id);

    return job;
  }

  public async getPrintJobStatus(job: Job): Promise<PrintStatus> {
    return {
      state: (await job.isActive())
        ? (await job.progress()) == 0
          ? 'starting'
          : await job.progress()
        : await job.getState(),
      error: job.failedReason,
    };
  }

  public async removePrintJob(job: Job): Promise<void> {
    this.logger.debug(`Removing job ${job.id}`);

    return job.remove();
  }

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.log('Clean printer queue');

    this.printerQueue.clean(
      this.configService.get<number>('persistPeriod'),
      'completed',
    );
  }
}
