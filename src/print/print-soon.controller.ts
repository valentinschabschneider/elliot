import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';
import { PrintOutputType } from './print-output-type.enum';
import { PrintServiceFactory } from './print.service.factory';

@Controller('print/:outputType/soon')
@ApiTags('print/soon')
export class PrintSoonController {
  constructor(private readonly printServiceFactory: PrintServiceFactory) {}

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
    @Body() html?: string,
  ): Promise<StreamableFile | string> {
    if (url === undefined && (html === undefined || html === '')) {
      throw new BadRequestException(
        'You have to set either url or html parameter.',
      );
    } else if (url !== undefined && html !== undefined && html !== '') {
      throw new BadRequestException(
        "You can't use both url and html parameters.",
      );
    }

    const printService = this.printServiceFactory.create(outputType);

    return await printService.print(
      { url, html },
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
  }
}
