import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { PagedjsModule } from './pagedjs/pagedjs.module';
import { PreviewModule } from './preview/preview.module';
import { PrintModule } from './print/print.module';

@Module({
  imports: [
    AuthModule,
    PrintModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules/pagedjs-cli/dist'),
      serveRoot: '/static/pagedjs',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'static'),
      serveRoot: '/static',
    }),
    PreviewModule,
    PagedjsModule,
  ],
})
export class AppModule {}
