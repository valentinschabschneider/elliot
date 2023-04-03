import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { PrintStep } from '../pagedjs/print-step.enum';
import { PrintOptions } from '../whatever/print-options.interface';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { JobProgress } from './job-progress.enum';
import { JobReturnValue } from './job-return-value.interface';

@Processor({ name: 'print' }) // , scope: Scope.REQUEST
export class QueueConsumer {
  constructor(private readonly printServiceFactory: PrintServiceFactory) {}

  @Process()
  async transcode(job: Job<PrintOptions>): Promise<JobReturnValue> {
    const printService = this.printServiceFactory.create(job.data.outputType);

    const data = await printService.print(
      job.data.input,
      job.data.additionalScripts,
      job.data.timeout,
      job.data.injectPolyfill,
      async (step: PrintStep) => await job.progress(step.toString()),
    );

    job.progress(JobProgress.FINISHED);

    return { data, outputType: job.data.outputType };
  }
}
