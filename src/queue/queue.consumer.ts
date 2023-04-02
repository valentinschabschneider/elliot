import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { PrintStep } from '../pagedjs/print-step.enum';
import { PrintOptionsModel } from '../whatever/print-options.model';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { JobProgress } from './job-progress.enum';

@Processor({ name: 'print' }) // , scope: Scope.REQUEST
export class QueueConsumer {
  constructor(private readonly printServiceFactory: PrintServiceFactory) {}

  @Process()
  async transcode(job: Job<PrintOptionsModel>) {
    const printService = this.printServiceFactory.create(job.data.outputType);

    const returnvalue = await printService.print(
      job.data.input,
      job.data.additionalScripts,
      job.data.timeout,
      job.data.injectPolyfill,
      async (step: PrintStep) => await job.progress(step.toString()),
    );

    job.progress(JobProgress.FINISHED);

    return returnvalue;
  }
}
