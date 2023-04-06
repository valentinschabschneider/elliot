import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintQueueService } from '../queue/print-queue.service';
import { PrintSoonCreateDto } from '../queue/print-soon-create.dto';
import { PrintSoonStatusDto } from '../queue/print-soon-status.dto';
import { PrintOutputType } from '../whatever/print-output-type.enum';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';

const PRIORITY = 1;
@Controller('print/:outputType/soon')
@ApiTags('print/soon')
export class PrintSoonController {
  constructor(private readonly queueService: PrintQueueService) {}

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  @ApiConsumes('text/html')
  @ApiBody({ required: false })
  async printNowWithParamsPost(
    @Param('outputType') outputType: PrintOutputType,
    @Query(new ValidationPipe({ transform: true }))
    {
      url,
      additionalScripts,
      timeout,
      injectPolyfill,
      httpHeaders,
    }: PrintUrlOptionalDto,
    @Body() html?: string,
  ): Promise<PrintSoonCreateDto> {
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

    const job = await this.queueService.addPrintJob(
      {
        input: { url, html },
        outputType,
        additionalScripts,
        timeout,
        injectPolyfill,
        httpHeaders,
      },
      PRIORITY,
    );

    return { id: job.id.toString() };
  }

  @Get(':jobId')
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(ConditionalHtmlExceptionsFilter)
  async getJobInfo(@Param('jobId') jobId: string): Promise<PrintSoonStatusDto> {
    const job = await this.queueService.getPrintJob(jobId);

    return {
      state: job.isActive()
        ? job.progress() == 0
          ? 'starting'
          : job.progress()
        : job.getState(),
      error: job.failedReason,
    }; // TODO: make better
  }
}
