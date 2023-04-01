import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PreviewModule } from '../preview/preview.module';
import { PreviewService } from '../preview/preview.service';
import { PrintHtmlService } from './print-html.service';
import { PrintPdfService } from './print-pdf.service';
import { PrintController } from './print.controller';
import { PrintServiceFactory } from './print.service.factory';

@Module({
  imports: [JwtModule, PagedjsModule, PreviewModule],
  controllers: [PrintController],
  providers: [
    PrintServiceFactory,
    PrintPdfService,
    PrintHtmlService,
    PreviewService,
  ],
})
export class PrintModule {}
