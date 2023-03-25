import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { PagedJsException } from './pagedjs.exception';
import { PrinterOptions } from './printer-options.interface';

let Printer;

@Injectable()
export class PrintService {
  private readonly logger = new Logger(PrintService.name);

  constructor(private readonly configService: ConfigService) {}

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
        browserEndpoint: this.configService.get<string>('browserEndpoint'),
      }),
    );
  }

  private async printPdf(
    url: string,
    printerOptions: PrinterOptions,
  ): Promise<Uint8Array> {
    this.logger.log('Print: ' + url);

    const printer = await this.createPrinter(printerOptions);

    try {
      const file: Uint8Array = await printer.pdf(url, {
        outlineTags: ['h1', 'h2', 'h3'], // TODO: research meaning and make configurable
        width: undefined,
        height: undefined,
        orientation: undefined,
      });

      this.logger.log('Processed');

      return file;
    } catch (error) {
      this.logger.error(error);
      throw new PagedJsException();
    }
  }

  private async createPrinter(printerOptions: PrinterOptions) {
    if (!Printer) {
      this.logger.debug('Creating pagedjs-cli printer');
      Printer = (await import('pagedjs-cli')).default;
    }

    const printer = new Printer(printerOptions);

    printer.on('page', (page) => {
      if (page.position === 0) {
        this.logger.log('Loaded');

        this.logger.log('Rendering: Page ' + (page.position + 1));
      } else {
        this.logger.log('Rendering: Page ' + (page.position + 1));
      }
    });

    printer.on('rendered', (msg) => {
      this.logger.log(msg);
      this.logger.log('Generating');
    });

    printer.on('postprocessing', (msg) => {
      this.logger.log(msg);
      this.logger.log('Generated');
      this.logger.log('Processing');
    });

    return printer;
  }
}
