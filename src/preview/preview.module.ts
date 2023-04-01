import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PreviewService } from './preview.service';

@Module({
  imports: [JwtModule, PagedjsModule],
  providers: [PreviewService],
})
export class PreviewModule {}
