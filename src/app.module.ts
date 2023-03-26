import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { PrintModule } from './print/print.module';
import { PreviewModule } from './preview/preview.module';
import { PagedjsModule } from './pagedjs/pagedjs.module';

@Module({
  imports: [
    AuthModule,
    PrintModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules/pagedjs/dist'),
      serveRoot: '/static',
    }),
    PreviewModule,
    PagedjsModule,
  ],
})
export class AppModule {}
