import {
  InjectQueue,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { get } from 'env-var';

import { Logger } from '@nestjs/common';
import { PrintStep } from '../pagedjs/print-step.enum';
import { PrintOptions } from '../whatever/print-options.interface';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { JobReturnValue } from './job-return-value.interface';

@Processor({ name: 'printer' })
export class PrinterQueueConsumer {
  private readonly logger = new Logger(PrinterQueueConsumer.name);

  constructor(
    private readonly printServiceFactory: PrintServiceFactory,
    @InjectQueue('callbacker') private callbackerQueue: Queue,
  ) {}

  @Process({
    name: 'print',
    concurrency: get('QUEUE_CONCURRENCY').default(1).asIntPositive(), // TODO: hmmmmmmmmm
  })
  async transcode(job: Job<PrintOptions>): Promise<JobReturnValue> {
    this.logger.log(`Process job ${job.id}`);

    const printService = this.printServiceFactory.create(job.data.outputType);

    const data = await printService.print(
      job.data.input,
      job.data.additionalScripts,
      job.data.timeout,
      job.data.injectPolyfill,
      job.data.httpHeaders,
      job.data.cookies,
      async (step: PrintStep) => await job.progress(step.toString()),
    );

    return { data, outputType: job.data.outputType };
  }

  @OnQueueCompleted({ name: 'print' })
  completedHandler(job: Job) {
    this.logger.log(`Finished print ${job.id}`);

    this.processHandler(job);
  }

  @OnQueueFailed({ name: 'print' })
  failedHandler(job: Job, e: Error) {
    this.logger.error(`Failed print ${job.id}`, e);

    this.processHandler(job);
  }

  private processHandler(job: Job) {
    if (job.data.callbackUrl) {
      this.logger.log(`Addin callback job for print job ${job.id}`);

      this.callbackerQueue.add('callback', job.id);
    }
  }
}
