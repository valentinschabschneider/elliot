import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PreviewController } from './preview.controller';
import { PreviewService } from './preview.service';

@Module({
  imports: [JwtModule, PagedjsModule],
  controllers: [PreviewController],
  providers: [PreviewService],
})
export class PreviewModule {}
