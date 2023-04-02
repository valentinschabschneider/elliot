import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { PrintUrlOptionalDto } from './dto/print-url-optional.dto';
import { PrintUrlRequiredDto } from './dto/print-url-required.dto';
import { PrintOutputType } from './print-output-type.enum';
import { PrintServiceFactory } from './print.service.factory';

@Controller('print/:outputType/now')
@ApiTags('print/now')
export class PrintNowController {
  constructor(
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
    const printService = this.printServiceFactory.create(outputType);

    return await printService.print(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
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
      { html },
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
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

    const printService = this.printServiceFactory.create(outputType);

    return await printService.print(
      url,
      download,
      fileName,
      additionalScripts,
      timeout,
      injectPolyfill,
      response,
    );
  }
}
