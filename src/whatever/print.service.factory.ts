import { Injectable, NotImplementedException } from '@nestjs/common';
import { PagedJsService } from '../pagedjs/pagedjs.service';
import { PreviewService } from '../preview/preview.service';
import { PrintHtmlService } from './print-html.service';
import { PrintOutputType } from './print-output-type.enum';
import { PrintPdfService } from './print-pdf.service';
import { IPrintService } from './print.service.interface';

@Injectable()
export class PrintServiceFactory {
  constructor(
    private readonly pagedjsService: PagedJsService,
    private readonly previewService: PreviewService,
  ) {}

  public create(printType: PrintOutputType): IPrintService {
    switch (printType) {
      case PrintOutputType.PDF:
        return new PrintPdfService(this.pagedjsService);
      case PrintOutputType.HTML:
        return new PrintHtmlService(this.pagedjsService, this.previewService);
      default:
        throw new NotImplementedException(
          `No service defined for the print type "${printType}"`,
        );
    }
  }
}
