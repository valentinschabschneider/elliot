import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { PrintModule } from './print/print.module';

@Module({
  imports: [
    AuthModule,
    PrintModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'node_modules/pagedjs/dist'),
      serveRoot: '/dist',
    }),
  ],
})
export class AppModule {}
