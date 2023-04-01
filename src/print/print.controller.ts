import {
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
import { GetPrintDto } from './dto/get-print.dto';
import { PostPrintDto } from './dto/post-print.dto';
import { PrintOutputType } from './print-output-type.enum';
import { PrintServiceFactory } from './print.service.factory';

@Controller('print/:outputType/now')
@ApiTags('print')
export class PrintController {
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
    }: GetPrintDto,
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
  @ApiBody({})
  async printNowWithParamsPost(
    @Res({ passthrough: true }) response: Response,
    @Param('outputType') outputType: PrintOutputType,
    @Query(new ValidationPipe({ transform: true }))
    {
      download,
      additionalScripts,
      timeout,
      fileName,
      injectPolyfill,
    }: PostPrintDto,
    @Body() html: string,
  ): Promise<StreamableFile | string> {
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
    } = Object.assign(new GetPrintDto(), this.jwtService.decode(jwt));

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
