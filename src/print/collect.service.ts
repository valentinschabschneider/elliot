import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

import { Job } from 'bull';
import { JobReturnValue } from '../queue/job-return-value.interface';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { PrintServiceFactory } from '../whatever/print.service.factory';

@Injectable()
export class CollectService {
  private readonly logger = new Logger(CollectService.name);

  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly printServiceFactory: PrintServiceFactory,
  ) {}

  async buildCollectResponse(
    jobReturnValue: JobReturnValue,
    cleanupJob: Job | null,
    response: Response,
  ): Promise<StreamableFile | string> {
    const printService = this.printServiceFactory.create(
      jobReturnValue.outputType,
    );

    const collectResponse = printService.createResponse(
      jobReturnValue.data,
      response,
    );

    if (cleanupJob) await this.printerQueueService.removePrintJob(cleanupJob);

    return collectResponse;
  }
}
