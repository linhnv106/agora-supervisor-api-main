import { Module } from '@nestjs/common';
import { LogService } from './loggers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from './entities/logger.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Logger, User])],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
