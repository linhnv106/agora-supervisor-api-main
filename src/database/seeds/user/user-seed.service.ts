import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from 'src/modules/roles/roles.enum';
import { Status } from 'src/utils/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserSeedService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async run() {
    const countStreamer = await this.repository.count({
      where: { role: RoleEnum.Streamer },
    });

    if (countStreamer === 0) {
      await this.repository.save(
        this.repository.create({
          fullName: 'Streamer',
          email: 'streamer@gmail.com',
          password: 'secret',
          status: Status.Active,
          role: RoleEnum.Streamer,
        }),
      );
    }

    const countUser = await this.repository.count({
      where: { role: RoleEnum.Viewer },
    });

    if (countUser === 0) {
      await this.repository.save(
        this.repository.create({
          fullName: 'Viewer',
          email: 'viewer@gmail.com',
          password: 'secret',
          status: Status.Active,
          role: RoleEnum.Viewer,
        }),
      );
    }
  }
}
