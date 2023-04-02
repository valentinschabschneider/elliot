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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { JwtParamAuthGuard } from '../auth/jwt-param-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintQueueService } from '../queue/print-queue.service';
import { PrintOutputType } from '../whatever/print-output-type.enum'; // TODO: dont konw if it should be here, mabye common
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';
import { PrintUrlRequiredDto } from './dto/print-url-required.dto';

const PRIORITY = 2;

@Controller('print/:outputType/now')
@ApiTags('print/now')
export class PrintNowController {
  constructor(
    private readonly printQueueService: PrintQueueService,
    private readonly printServiceFactory: PrintServiceFactory,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
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
    }: PrintUrlRequiredDto,
  ): Promise<StreamableFile | string> {
    const job = await this.printQueueService.addPrintJob(
      {
        input: { url },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
      },
      PRIORITY,
    );

    await job.finished();

    if (await job.isFailed()) {
      throw new InternalServerErrorException(job.failedReason);
    }

    const printService = this.printServiceFactory.create(outputType);

    const jobResult = await this.printQueueService.getPrintJobResult(
      job.id.toString(),
    ); // TODO: use job instead of job.id.toString()

    return printService.createResponse(jobResult, download, fileName, response);
  }

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
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

    //
    // TODO: remove duplicate code
    //

    const job = await this.printQueueService.addPrintJob(
      {
        input: { url, html },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
      },
      PRIORITY,
    );

    await job.finished();

    if (await job.isFailed()) {
      throw new InternalServerErrorException(job.failedReason);
    }

    const printService = this.printServiceFactory.create(outputType);

    const jobResult = await this.printQueueService.getPrintJobResult(
      job.id.toString(),
    ); // TODO: use job instead of job.id.toString()

    return printService.createResponse(jobResult, download, fileName, response);
  }

  @Get(':jwt')
  @UseGuards(JwtParamAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
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
    } = Object.assign(new PrintUrlRequiredDto(), this.jwtService.decode(jwt));

    //
    // TODO: remove duplicate code
    //

    const job = await this.printQueueService.addPrintJob(
      {
        input: { url },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
      },
      PRIORITY,
    );

    await job.finished();

    if (await job.isFailed()) {
      throw new InternalServerErrorException(job.failedReason);
    }

    const printService = this.printServiceFactory.create(outputType);

    const jobResult = await this.printQueueService.getPrintJobResult(
      job.id.toString(),
    ); // TODO: use job instead of job.id.toString()

    return printService.createResponse(jobResult, download, fileName, response);
  }
}
