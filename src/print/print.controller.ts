import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { JwtParamAuthGuard } from '../auth/jwt-param-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintDto } from './print.dto';
import { PrintService } from './print.service';

@Controller('print')
@ApiTags('print')
export class PrintController {
  constructor(
    private readonly printService: PrintService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('pdf')
  @Header('Content-Type', 'application/pdf')
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async printPdf(
    @Res({ passthrough: true }) response: Response,
    @Query(new ValidationPipe({ transform: true }))
    {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
    }: PrintDto,
  ): Promise<StreamableFile> {
    return await this.printService.generatePrintPdfResponse(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
  }

  @Get('pdf/:jwt')
  @Header('Content-Type', 'application/pdf')
  @UseGuards(JwtParamAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async printJwtPdf(
    @Res({ passthrough: true }) response: Response,
    @Param('jwt') jwt: string,
  ): Promise<StreamableFile> {
    const {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
    } = Object.assign(new PrintDto(), this.jwtService.decode(jwt));

    return await this.printService.generatePrintPdfResponse(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
  }
}
