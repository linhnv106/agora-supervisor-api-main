import { Module } from '@nestjs/common';
import { DevSupportsController } from './dev-supports.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [DevSupportsController],
  imports: [UsersModule],
})
export class DevSupportsModule {}
