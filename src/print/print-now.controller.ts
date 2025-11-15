import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { get } from 'env-var';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { CollectService } from './collect.service';
import { PrintDto } from './dto/print.dto';

const PRIORITY = 2;

@Controller('print/now')
@ApiTags('print/now')
export class PrintNowController {
  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly collectService: CollectService,
    private readonly printServiceFactory: PrintServiceFactory,
  ) {}

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('Api key')
  @ApiConsumes('text/html')
  @ApiBody({ required: false })
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the job output type.',
  })
  // @ApiProduces('application/pdf')
  async printNowPdfWithParamsPost(
    @Res({ passthrough: true }) response: Response,
    @Query(new ValidationPipe({ transform: true }))
    {
      outputType,
      url,
      additionalScripts,
      timeout,
      injectPolyfill,
      httpHeaders,
      cookies,
      compressionLevel,
    }: PrintDto,
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

    if (get('REDIS_URL').asUrlObject() !== undefined) {
      const job = await this.printerQueueService.addPrintJob(
        {
          input: { url, html },
          outputType,
          additionalScripts,
          timeout,
          injectPolyfill,
          httpHeaders,
          cookies,
          compressionLevel,
        },
        PRIORITY,
      );

      let jobReturnValue = null;

      try {
        jobReturnValue = await job.finished();
      } catch (e) {
        throw new InternalServerErrorException(e.message);
      }

      return this.collectService.buildCollectResponse(
        jobReturnValue,
        job,
        response,
      );
    } else {
      const printService = this.printServiceFactory.create(outputType);

      const data = await printService.print(
        { url, html },
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
        cookies,
        async (_) => null,
        compressionLevel,
      );

      return this.collectService.buildCollectResponse(
        { data, outputType },
        null,
        response,
      );
    }
  }
}
