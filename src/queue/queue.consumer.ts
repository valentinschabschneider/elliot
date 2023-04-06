import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { get } from 'env-var';

import { Logger } from '@nestjs/common';
import { PrintStep } from '../pagedjs/print-step.enum';
import { PrintOptions } from '../whatever/print-options.interface';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { JobReturnValue } from './job-return-value.interface';

@Processor({ name: 'printer' })
export class QueueConsumer {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(private readonly printServiceFactory: PrintServiceFactory) {}

  @Process({
    name: 'print',
    concurrency: get('QUEUE_CONCURRENCY').default(1).asIntPositive(),
  }) // TODO: hmmmmmmmmm
  async transcode(job: Job<PrintOptions>): Promise<JobReturnValue> {
    this.logger.log(`Process job ${job.id}`);

    const printService = this.printServiceFactory.create(job.data.outputType);

    const data = await printService.print(
      job.data.input,
      job.data.additionalScripts,
      job.data.timeout,
      job.data.injectPolyfill,
      job.data.httpHeaders,
      async (step: PrintStep) => await job.progress(step.toString()),
    );

    return { data, outputType: job.data.outputType };
  }
}
