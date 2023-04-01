import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

import { PagedJsService } from '../pagedjs/pagedjs.service';
import { IPrintService } from './print.service.interface';

@Injectable()
export class PrintPdfService implements IPrintService {
  private readonly logger = new Logger(PrintPdfService.name);

  constructor(private readonly pagedjsService: PagedJsService) {}

  async print(
    url: string,
    download: boolean,
    fileName: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    response: Response,
  ): Promise<StreamableFile> {
    if (download) {
      response.attachment(fileName ?? 'document.pdf');
    } else {
      response.setHeader(
        'Content-Disposition',
        `filename="${fileName ?? 'document.pdf'}"`,
      );
    }

    response.contentType('application/pdf');

    return new StreamableFile(
      await this.printPdf(url, additionalScripts, timeout, injectPolyfill),
    );
  }

  private async printPdf(
    url: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
  ): Promise<Uint8Array> {
    return this.pagedjsService.printPdf(
      url,
      this.pagedjsService.createPrinter({
        additionalScripts,
        timeout,
        closeAfter: true,
        disableScriptInjection: !injectPolyfill,
      }),
    );
  }
}
