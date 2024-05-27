import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from './entities/logger.entity';
import { Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Logger) private repository: Repository<Logger>,
  ) {}

  log(reqUser: User, message: string, payload?: Record<string, any>) {
    return this.repository.save(
      this.repository.create({ reqUser, message, payload }),
    );
  }

  getLogs(paginationOptions: IPaginationOptions): Promise<Logger[]> {
    return this.repository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }
}
