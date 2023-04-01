import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

import { PagedJsService } from '../pagedjs/pagedjs.service';
import { PreviewService } from '../preview/preview.service';
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
    url: string,
    download: boolean,
    fileName: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    response: Response,
  ): Promise<string> {
    if (download) {
      response.attachment(fileName ?? 'document.html');
    } else {
      response.contentType('text/html');
    }

    return this.printHtml(
      url,
      additionalScripts,
      timeout,
      injectPolyfill,
      true,
    );
  }

  private async printHtml(
    url: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    preview: boolean,
  ): Promise<string> {
    return this.pagedjsService.generateHTML(
      url,
      this.pagedjsService.createPrinter({
        additionalScripts,
        timeout,
        emulateMedia: (preview
          ? PrintMedia.SCREEN
          : PrintMedia.PRINT
        ).toString(),
        closeAfter: false,
        disableScriptInjection: !injectPolyfill,
      }),
      ...(preview
        ? [this.previewService.getStyles(), this.previewService.getScripts()]
        : []),
    );
  }
}
