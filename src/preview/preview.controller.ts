import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConditionalHtmlExceptionsFilter } from '../common/conditional-html.filter';
import { PrintDto } from '../print/print.dto'; // aaaaaaaaaaaaaaaaaaaaaaaaaaaaaah
import { ApiKeyAuthGuard } from '../auth/api-key-auth.guard';
import { JwtParamAuthGuard } from '../auth/jwt-param-auth.guard';
import { PreviewService } from './preview.service';

@Controller('preview')
export class PreviewController {
  constructor(
    private readonly previewService: PreviewService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html')
  @UseGuards(ApiKeyAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async printPdf(
    @Query(new ValidationPipe({ transform: true }))
    { url, additionalScripts, timeout }: PrintDto,
  ): Promise<string> {
    return await this.previewService.generateHTML(
      url,
      additionalScripts,
      timeout,
    );
  }

  @Get(':jwt')
  @Header('Content-Type', 'text/html')
  @UseGuards(JwtParamAuthGuard)
  @UseFilters(new ConditionalHtmlExceptionsFilter())
  async getJwtHTML(@Param('jwt') jwt: string): Promise<string> {
    const { url, additionalScripts, timeout } = Object.assign(
      new PrintDto(),
      this.jwtService.decode(jwt),
    );

    return await this.previewService.generateHTML(
      url,
      additionalScripts,
      timeout,
    );
  }
}
