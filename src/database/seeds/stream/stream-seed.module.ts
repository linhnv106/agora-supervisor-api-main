import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamSeedService } from './stream-seed.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Stream } from 'src/modules/streams/entities/stream.entity';
import { Viewer } from 'src/modules/streams/entities/viewer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, User, Viewer])],
  providers: [StreamSeedService],
  exports: [StreamSeedService],
})
export class StreamSeedModule {}
