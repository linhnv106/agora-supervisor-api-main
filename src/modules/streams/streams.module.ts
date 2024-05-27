import { Module } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Stream } from './entities/stream.entity';
import { Viewer } from './entities/viewer.entity';
import { AccessViewer } from './entities/viewer-list.entity';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Stream, Viewer, AccessViewer])],
  controllers: [StreamsController],
  providers: [StreamsService, UsersService],
})
export class StreamsModule {}
