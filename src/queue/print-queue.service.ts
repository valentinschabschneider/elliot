import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { v4 as uuid } from 'uuid';

import { PrintOptions } from '../whatever/print-options.interface'; // TODO: mabye put somewhere else
import { JobReturnValue } from './job-return-value.interface';

@Injectable()
export class PrintQueueService {
  private readonly logger = new Logger(PrintQueueService.name);

  constructor(
    @InjectQueue('printer') private queue: Queue,
    private readonly configService: ConfigService,
  ) {}

  public async addPrintJob(
    options: PrintOptions,
    priority: number,
  ): Promise<Job> {
    const job = await this.queue.add('print', options, {
      jobId: uuid(),
      priority,
      attempts: 1,
    });

    return job;
  }

  public async getPrintJob(id: string): Promise<Job> {
    const job = await this.queue.getJob(id);

    return job;
  }

  public async getPrintJobResult(id: string): Promise<JobReturnValue> {
    const job = await this.queue.getJob(id);

    if (!(await job.isCompleted())) {
      throw new BadRequestException('Job not finished yet');
    }

    return job.returnvalue;
  }

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.log('Clean queue');
    this.queue.clean(
      this.configService.get<number>('persistPeriod'),
      'completed',
    );
  }
}
