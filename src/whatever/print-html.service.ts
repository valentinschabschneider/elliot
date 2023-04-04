import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

import { PagedJsService } from '../pagedjs/pagedjs.service';
import { PrintStep } from '../pagedjs/print-step.enum';
import { PreviewService } from '../preview/preview.service';
import { PrintInput } from './print-input.interface';
import { PrintMedia } from './print-media.enum';
import { IPrintService } from './print.service.interface';

@Injectable()
export class PrintHtmlService implements IPrintService {
  private readonly logger = new Logger(PrintHtmlService.name);

  constructor(
    private readonly pagedjsService: PagedJsService,
    private readonly previewService: PreviewService,
  ) {}

  async print(
    input: PrintInput,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    extraHttpHeaders: Record<string, string>[],
    currentStepCallback: (step: PrintStep) => void,
  ): Promise<string> {
    const preview = true;

    return this.pagedjsService.generateHTML(
      input,
      this.pagedjsService.createPrinter(
        {
          additionalScripts,
          timeout,
          emulateMedia: (preview
            ? PrintMedia.SCREEN
            : PrintMedia.PRINT
          ).toString(),
          closeAfter: false,
          disableScriptInjection: !injectPolyfill,
          extraHttpHeaders,
        },
        currentStepCallback,
      ),
      currentStepCallback,
      ...(preview
        ? [this.previewService.getStyles(), this.previewService.getScripts()]
        : []),
    );
  }

  public createResponse(
    data: any,
    download: boolean,
    fileName: string,
    response: Response,
  ): string {
    if (download) {
      response.attachment(fileName ?? 'document.html');
    } else {
      response.contentType('text/html');
    }

    return data;
  }
}
