import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';

import { PagedJsService } from '../pagedjs/pagedjs.service';

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  constructor(private readonly pagedjsService: PagedJsService) {}

  async generatePrintPdfResponse(
    url: string,
    download: boolean,
    fileName: string,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    response: Response,
  ): Promise<StreamableFile> {
    if (download) {
      response.attachment(fileName);
    } else {
      response.setHeader('content-disposition', `filename="${fileName}"`);
    }

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
