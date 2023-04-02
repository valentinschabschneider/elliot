import { Module } from '@nestjs/common';
import { PagedjsModule } from '../pagedjs/pagedjs.module';
import { PreviewModule } from '../preview/preview.module';
import { PrintServiceFactory } from './print.service.factory';

@Module({
  imports: [PagedjsModule, PreviewModule],
  providers: [PrintServiceFactory],
  exports: [PrintServiceFactory],
})
export class WhateverModule {}
