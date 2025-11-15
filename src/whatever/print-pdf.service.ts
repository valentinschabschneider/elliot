import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { compress as compressPDF, Resolution } from 'compress-pdf';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { PagedJsService } from '../pagedjs/pagedjs.service';
import { PrintStep } from '../pagedjs/print-step.enum';
import { CookieDto } from '../print/dto/print.dto';
import { PrintInput } from './print-input.interface';
import { IPrintService } from './print.service.interface';

@Injectable()
export class PrintPdfService implements IPrintService {
  private readonly logger = new Logger(PrintPdfService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly pagedjsService: PagedJsService,
  ) {}

  public async print(
    input: PrintInput,
    additionalScripts: string[],
    timeout: number,
    injectPolyfill: boolean,
    httpHeaders: Record<string, string>,
    cookies: CookieDto[],
    currentStepCallback: (step: PrintStep) => void,
    compressionLevel: number,
  ): Promise<Array<number>> {
    let file = await this.pagedjsService.printPdf(
      input,
      this.pagedjsService.createPrinter(
        {
          additionalScripts,
          timeout,
          closeAfter: true,
          disableScriptInjection: !injectPolyfill,
          extraHTTPHeaders: httpHeaders,
          extraCookies: cookies,
        },
        currentStepCallback,
      ),
      currentStepCallback,
    );

    if (
      compressionLevel > 0 ||
      this.configService.get<number>('compressionLevel') > 0
    ) {
      currentStepCallback(PrintStep.COMPRESSING);

      let resolution: Resolution;
      switch (compressionLevel) {
        case 1:
          resolution = 'default';
          break;
        case 2:
          resolution = 'prepress';
          break;
        case 3:
          resolution = 'printer';
          break;
        case 4:
          resolution = 'ebook';
          break;
        case 5:
          resolution = 'screen';
          break;
        default:
          resolution = 'default';
          break;
      }

      file = await compressPDF(Buffer.from(file), {
        resolution,
      });

      this.logger.log('Compressed');
    }

    return Array.from(file);
  }

  public createResponse(data: any, response: Response): StreamableFile {
    response.contentType('application/pdf');

    return new StreamableFile(Uint8Array.from(data));
  }
}
