import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { CollectService } from './collect.service';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';

@Controller('collect/:jobId')
@ApiTags('collect')
export class CollectController {
  private readonly logger = new Logger(CollectController.name);

  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly configService: ConfigService,
    private readonly collectService: CollectService,
  ) {}

  @Get()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  @ApiOkResponse({
    description: 'PDF file or HTML string depending on the job output type.',
  })
  async getJobResult(
    @Res({ passthrough: true }) response: Response,
    @Param('jobId') jobId: string,
    @Query(new ValidationPipe({ transform: true }))
    { download, fileName, cleanupJob }: PrintUrlOptionalDto,
  ): Promise<StreamableFile | string> {
    this.logger.log(`Collecting job ${jobId}`);

    const job = await this.printerQueueService.getPrintJob(jobId);

    if (!job) throw new NotFoundException('Job not found');

    if (!(await job.isCompleted())) {
      throw new BadRequestException('Job not finished yet');
    }

    return this.collectService.buildCollectResponse(
      job.returnvalue,
      download,
      fileName,
      this.configService.get<boolean>('cleanupJobAfterCollected') || cleanupJob
        ? job
        : null,
      response,
    );
  }
}
