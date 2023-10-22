import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { JwtParamAuthGuard } from '../auth/jwt-param-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { PrintOptions } from '../whatever/print-options.interface';
import { PrintOutputType } from '../whatever/print-output-type.enum'; // TODO: dont konw if it should be here, mabye common
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';
import { PrintUrlRequiredDto } from './dto/print-url-required.dto';

const PRIORITY = 2;

@Controller('print/:outputType/now')
@ApiTags('print/now')
export class PrintNowController {
  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @ApiSecurity('Api key')
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  async printNowWithParams(
    @Res({ passthrough: true }) response: Response,
    @Param('outputType') outputType: PrintOutputType,
    @Query(new ValidationPipe({ transform: true }))
    {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
      httpHeaders,
      cleanupJob,
    }: PrintUrlRequiredDto,
  ) {
    return this.doStuff(
      {
        input: { url },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
      },
      PRIORITY,
      response,
      download,
      fileName,
      cleanupJob,
    );
  }

  @Post()
  @ApiSecurity('Api key')
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  @ApiConsumes('text/html')
  @ApiBody({ required: false })
  async printNowWithParamsPost(
    @Res({ passthrough: true }) response: Response,
    @Param('outputType') outputType: PrintOutputType,
    @Query(new ValidationPipe({ transform: true }))
    {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
      httpHeaders,
      cleanupJob,
    }: PrintUrlOptionalDto,
    @Body() html: string,
  ) {
    if (url === undefined && (typeof html !== 'string' || html === '')) {
      throw new BadRequestException(
        'You have to set either url or html parameter.',
      );
    } else if (url !== undefined) {
      if (typeof html === 'string' && html !== '') {
        throw new BadRequestException(
          "You can't use both url and html parameters.",
        );
      } else {
        html = undefined;
      }
    }

    return this.doStuff(
      {
        input: { url },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
      },
      PRIORITY,
      response,
      download,
      fileName,
      cleanupJob,
    );
  }

  @Get(':jwt')
  @UseGuards(JwtParamAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  async printNowWithJwt(
    @Res({ passthrough: true }) response: Response,
    @Param('outputType') outputType: PrintOutputType,
    @Param('jwt') jwt: string,
  ) {
    const {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
      httpHeaders,
      cleanupJob,
    } = Object.assign(new PrintUrlRequiredDto(), this.jwtService.decode(jwt));

    return this.doStuff(
      {
        input: { url },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
      },
      PRIORITY,
      response,
      download,
      fileName,
      cleanupJob,
    );
  }

  // put somewhere it makes sense, some service
  private async doStuff(
    options: PrintOptions,
    priority: number,
    response: Response,
    download: boolean,
    fileName: string,
    cleanupJob: boolean,
  ) {
    const job = await this.printerQueueService.addPrintJob(options, priority);

    try {
      await job.finished();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }

    return response.redirect(
      `/collect/${job.id}?download=${download}&cleanupJob=${cleanupJob}` +
        (fileName !== undefined ? `&fileName=${fileName}` : ''), // TODO: make better
    );
  }
}
