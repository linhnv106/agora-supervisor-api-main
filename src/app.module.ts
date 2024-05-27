import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import authConfig from './configs/auth.config';
import appConfig from './configs/app.config';
import agoraConfig from './configs/agora.config';
import databaseConfig from './configs/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { DevSupportsModule } from './modules/dev-supports/dev-supports.module';
import { UsersModule } from './modules/users/users.module';
import { StreamsModule } from './modules/streams/streams.module';
import { SessionModule } from './modules/sessions/sessions.module';
import { LogModule } from './modules/loggers/loggers.module';
import { LoggerMiddleware } from './global/logger.middleware';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, agoraConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    AuthModule,
    DevSupportsModule,
    UsersModule,
    StreamsModule,
    SessionModule,
    HealthModule,
    LogModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
