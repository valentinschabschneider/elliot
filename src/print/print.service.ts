import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { PrinterOptions } from 'pagedjs-cli';

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
    response: Response,
  ): Promise<StreamableFile> {
    if (download) {
      response.attachment(fileName);
    }

    return new StreamableFile(
      await this.printPdf(url, {
        additionalScripts,
        timeout,
      }),
    );
  }

  private async printPdf(
    url: string,
    printerOptions: PrinterOptions,
  ): Promise<Uint8Array> {
    return this.pagedjsService.printPdf(
      url,
      this.pagedjsService.createPrinter(printerOptions),
    );
  }
}
