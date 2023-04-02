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
    currentStepCallback: (step: PrintStep) => void,
  ): Promise<Uint8Array> {
    const file = await this.pagedjsService.printPdf(
      input,
      this.pagedjsService.createPrinter(
        {
          additionalScripts,
          timeout,
          closeAfter: true,
          disableScriptInjection: !injectPolyfill,
        },
        currentStepCallback,
      ),
      currentStepCallback,
    );

    return file;
  }

  public createResponse(
    data: any,
    download: boolean,
    fileName: string,
    response: Response,
  ): StreamableFile {
    if (download) {
      response.attachment(fileName ?? 'document.pdf');
    } else {
      response.setHeader(
        'Content-Disposition',
        `filename="${fileName ?? 'document.pdf'}"`,
      );
    }

    response.contentType('application/pdf');

    const file = new Uint8Array(Object.values(data)); // This hack is horrible.

    return new StreamableFile(file);
  }
}
