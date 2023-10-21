import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrinterQueueService } from '../queue/printer-queue.service';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';

@Controller('collect/:jobId')
@ApiTags('collect')
export class CollectController {
  private readonly logger = new Logger(CollectController.name);

  constructor(
    private readonly printerQueueService: PrinterQueueService,
    private readonly printServiceFactory: PrintServiceFactory,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  // @UseGuards(ApiKeyAuthGuard) // hmmmmm
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async getJobResult(
    @Res({ passthrough: true }) response: Response,
    @Param('jobId') jobId: string,
    @Query(new ValidationPipe({ transform: true }))
    { download, fileName, cleanupJob }: PrintUrlOptionalDto,
  ): Promise<StreamableFile | string> {
    this.logger.log(`Collecting job ${jobId}`);

    const job = await this.printerQueueService.getPrintJob(jobId);

    if (!job) throw new NotFoundException('Job not found');

    const jobReturnValue = await this.printerQueueService.getPrintJobResult(
      job,
    );

    const printService = this.printServiceFactory.create(
      jobReturnValue.outputType,
    );

    const collectResponse = printService.createResponse(
      jobReturnValue.data,
      download,
      fileName,
      response,
    );

    if (
      this.configService.get<boolean>('cleanupJobAfterCollected') ||
      cleanupJob
    )
      await this.printerQueueService.removePrintJob(job);

    return collectResponse;
  }
}
