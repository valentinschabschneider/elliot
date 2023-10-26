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
  StreamableFile,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { JwtParamAuthGuard } from '../auth/jwt-param-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { PrintOptions } from '../whatever/print-options.interface';
import { PrintOutputType } from '../whatever/print-output-type.enum'; // TODO: dont konw if it should be here, mabye common
import { CollectService } from './collect.service';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';
import { PrintUrlRequiredDto } from './dto/print-url-required.dto';

const PRIORITY = 2;

@Controller('print/:outputType/now')
@ApiTags('print/now')
export class PrintNowController {
  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly jwtService: JwtService,
    private readonly collectService: CollectService,
  ) {}

  @Get()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  @ApiSecurity('Api key')
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the output type.',
  })
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
    }: PrintUrlRequiredDto,
  ): Promise<StreamableFile | string> {
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
    );
  }

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  @ApiSecurity('Api key')
  @ApiConsumes('text/html')
  @ApiBody({ required: false })
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the output type.',
  })
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
    }: PrintUrlOptionalDto,
    @Body() html: string,
  ): Promise<StreamableFile | string> {
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
    );
  }

  @Get(':jwt')
  @UseGuards(JwtParamAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the output type.',
  })
  async printNowWithJwt(
    @Res({ passthrough: true }) response: Response,
    @Param('outputType') outputType: PrintOutputType,
    @Param('jwt') jwt: string,
  ): Promise<StreamableFile | string> {
    const {
      url,
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
      httpHeaders,
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
    );
  }

  // put somewhere it makes sense, some service
  private async doStuff(
    options: PrintOptions,
    priority: number,
    response: Response,
    download: boolean,
    fileName: string,
  ): Promise<StreamableFile | string> {
    const job = await this.printerQueueService.addPrintJob(options, priority);

    let jobReturnValue = null;

    try {
      jobReturnValue = await job.finished();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }

    return this.collectService.buildCollectResponse(
      jobReturnValue,
      download,
      fileName,
      job,
      response,
    );
  }
}
