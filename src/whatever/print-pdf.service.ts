import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

import { PagedJsService } from '../pagedjs/pagedjs.service';
import { PrintStep } from '../pagedjs/print-step.enum';
import { PrintInput } from './print-input.interface';
import { IPrintService } from './print.service.interface';

@Injectable()
export class PrintPdfService implements IPrintService {
  private readonly logger = new Logger(PrintPdfService.name);

  constructor(private readonly pagedjsService: PagedJsService) {}

  public async print(
    input: PrintInput,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    httpHeaders: Record<string, string>[],
    currentStepCallback: (step: PrintStep) => void,
  ): Promise<Array<number>> {
    const file = await this.pagedjsService.printPdf(
      input,
      this.pagedjsService.createPrinter(
        {
          additionalScripts,
          timeout,
          closeAfter: true,
          disableScriptInjection: !injectPolyfill,
          extraHttpHeaders: httpHeaders,
        },
        currentStepCallback,
      ),
      currentStepCallback,
    );

    return Array.from(file);
  }

  public createResponse(data: any, response: Response): StreamableFile {
    response.contentType('application/pdf');

    return new StreamableFile(Uint8Array.from(data));
  }
}
