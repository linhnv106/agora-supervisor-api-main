import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../typeorm-config.service';

import appConfig from 'src/configs/app.config';
import databaseConfig from 'src/configs/database.config';

import { UserSeedModule } from './user/user-seed.module';
import { StreamSeedModule } from './stream/stream-seed.module';

@Module({
  imports: [
    UserSeedModule,
    StreamSeedModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
