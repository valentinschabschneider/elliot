import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PrintController } from './print.controller';
import { PrintService } from './print.service';

@Module({
  imports: [JwtModule, PagedjsModule],
  controllers: [PrintController],
  providers: [PrintService],
})
export class PrintModule {}
