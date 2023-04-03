import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintQueueService } from '../queue/print-queue.service';
import { PrintServiceFactory } from '../whatever/print.service.factory';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';

@Controller('collect/:jobId')
@ApiTags('collect')
export class CollectController {
  constructor(
    private readonly queueService: PrintQueueService,
    private readonly printServiceFactory: PrintServiceFactory,
  ) {}

  @Get()
  // @UseGuards(ApiKeyAuthGuard) // hmmmmm
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async getJobResult(
    @Res({ passthrough: true }) response: Response,
    @Param('jobId') jobId: string,
    @Query(new ValidationPipe({ transform: true }))
    { download, fileName }: PrintUrlOptionalDto,
  ): Promise<StreamableFile | string> {
    const jobReturnValue = await this.queueService.getPrintJobResult(jobId);

    const printService = this.printServiceFactory.create(
      jobReturnValue.outputType,
    );

    return printService.createResponse(
      jobReturnValue.data,
      download,
      fileName,
      response,
    );
  }
}
