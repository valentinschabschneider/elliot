import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PreviewService } from './preview.service';

@Module({
  imports: [JwtModule],
  providers: [PreviewService],
  exports: [PreviewService],
})
export class PreviewModule {}
