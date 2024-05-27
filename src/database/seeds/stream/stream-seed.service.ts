import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StreamStatus, ViewStatus } from 'src/utils/enums';
import { Stream } from 'src/modules/streams/entities/stream.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Viewer } from 'src/modules/streams/entities/viewer.entity';

@Injectable()
export class StreamSeedService {
  constructor(
    @InjectRepository(Stream) private repository: Repository<Stream>,
    @InjectRepository(Viewer) private viewerRepository: Repository<Viewer>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      const stream = this.repository.create({
        name: 'Stream 1',
        status: StreamStatus.Idle,
        address: 'Location 1',
      });

      stream.owner = await this.userRepository.findOneBy({
        email: 'streamer@gmail.com',
      });

      const user = await this.userRepository.findOneBy({
        email: 'viewer@gmail.com',
      });

      const newStream = await this.repository.save(stream);

      await this.viewerRepository.save(
        await this.viewerRepository.create({
          streamID: newStream.id,
          userID: user.id,
          status: ViewStatus.Idle,
        }),
      );
    }
  }
}
