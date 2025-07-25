import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
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

import { ConfigService } from '@nestjs/config';
import { get } from 'env-var';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { PrintSoonCreateDto } from '../queue/print-soon-create.dto';
import { PrintSoonStatusDto } from '../queue/print-soon-status.dto';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { RedisNotConfiguredException } from '../queue/redis.exception';
import { CollectService } from './collect.service';
import { PrintUrlCallbackOptionalDto } from './dto/print-url-callback-optional.dto';
import { CollectDto } from './dto/print-url-optional.dto';

const PRIORITY = 1;

@Controller('print/soon')
@ApiTags('print/soon')
export class PrintSoonController {
  private readonly logger = new Logger(PrintSoonController.name);

  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly collectService: CollectService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('Api key')
  @ApiConsumes('text/html')
  @ApiBody({ required: false })
  @ApiOkResponse({
    description: 'Id of print job.',
    type: PrintSoonCreateDto,
  })
  async printSoonWithParamsPost(
    @Query(new ValidationPipe({ transform: true }))
    {
      outputType,
      url,
      additionalScripts,
      timeout,
      injectPolyfill,
      httpHeaders,
      cookies,
      callbackUrl,
    }: PrintUrlCallbackOptionalDto,
    @Body() html?: string,
  ): Promise<PrintSoonCreateDto> {
    if (get('REDIS_URL').asUrlObject() === undefined)
      throw new RedisNotConfiguredException();

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

    const job = await this.printerQueueService.addPrintJob(
      {
        input: { url, html },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
        callbackUrl,
        cookies,
      },
      PRIORITY,
    );

    return { id: job.id.toString() };
  }

  @Get('/jobs/:jobId')
  @ApiSecurity('Api key')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOkResponse({
    description: 'Object that contains print job status information.',
    type: PrintSoonStatusDto,
  })
  async getJobInfo(@Param('jobId') jobId: string): Promise<PrintSoonStatusDto> {
    const job = await this.printerQueueService.getPrintJob(jobId);

    if (!job) throw new NotFoundException('Job not found');

    return this.printerQueueService.getPrintJobStatus(job);
  }

  @Get('/jobs/:jobId/collect')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the job output type.',
  })
  async getJobResult(
    @Res({ passthrough: true }) response: Response,
    @Param('jobId') jobId: string,
    @Query(new ValidationPipe({ transform: true }))
    { cleanupJob }: CollectDto,
  ): Promise<StreamableFile | string> {
    this.logger.log(`Collecting job ${jobId}`);

    const job = await this.printerQueueService.getPrintJob(jobId);

    if (!job) throw new NotFoundException('Job not found');

    if (!(await job.isCompleted())) {
      throw new BadRequestException('Job not finished yet');
    }

    return this.collectService.buildCollectResponse(
      job.returnvalue,
      this.configService.get<boolean>('cleanupJobAfterCollected') || cleanupJob
        ? job
        : null,
      response,
    );
  }
}
