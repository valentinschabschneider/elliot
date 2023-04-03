import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { v4 as uuid } from 'uuid';

import { Cron } from '@nestjs/schedule';
import { PrintOptions } from '../whatever/print-options.interface'; // TODO: mabye put somewhere else
import { JobProgress } from './job-progress.enum';
import { JobReturnValue } from './job-return-value.interface';

@Injectable()
export class PrintQueueService {
  private readonly logger = new Logger(PrintQueueService.name);

  constructor(@InjectQueue('print') private queue: Queue) {}

  public async addPrintJob(
    options: PrintOptions,
    priority: number,
  ): Promise<Job> {
    const job = await this.queue.add(options, {
      jobId: uuid(),
      priority,
      attempts: 1,
    });

    job.progress(JobProgress.QUEUED);

    return job;
  }

  public async getPrintJobProgress(id: string): Promise<JobProgress> {
    const job = await this.queue.getJob(id);

    return job.progress();
  }

  public async getPrintJobResult(id: string): Promise<JobReturnValue> {
    const job = await this.queue.getJob(id);

    if (!(await job.isCompleted())) {
      throw new BadRequestException('Job not finished yet');
    }

    return job.returnvalue;
  }

  @Cron('0 0 * * * *')
  handleCron() {
    this.logger.debug('Clean queue');
    this.queue.clean(3600 * 1000, 'completed');
  }
}
