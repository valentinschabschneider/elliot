import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PrintService } from './print.service';
import { ConditionalHtmlExceptionsFilter } from './conditionalHtml.exceptionFilter';
import { PrintDto } from './printpdf.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('print')
@ApiTags('print')
export class PrintController {
  constructor(
    private readonly printService: PrintService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Get('pdf')
  @Header('Content-Type', 'application/pdf')
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async printPdf(
    @Res({ passthrough: true }) response: Response,
    @Query(new ValidationPipe({ transform: true }))
    { url, download, additionalScripts, timeout, fileName }: PrintDto,
  ): Promise<StreamableFile> {
    return await this.printService.generatePrintPdfResponse(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      response,
    );
  }

  @Get('pdf/:jwt')
  @Header('Content-Type', 'application/pdf')
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async printJwtPdf(
    @Res({ passthrough: true }) response: Response,
    @Param('jwt') jwt: string,
  ): Promise<StreamableFile> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    if (jwtSecret) {
      this.jwtService.verify(jwt, { secret: jwtSecret });
    }

    const { url, download, additionalScripts, timeout, fileName } =
      Object.assign(new PrintDto(), this.jwtService.decode(jwt));

    return await this.printService.generatePrintPdfResponse(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      response,
    );
  }
}
