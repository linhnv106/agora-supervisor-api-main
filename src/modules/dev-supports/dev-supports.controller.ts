import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Dev supports')
@Controller({ path: 'dev-supports', version: '1' })
export class DevSupportsController {
  constructor(private readonly userService: UsersService) {}

  @Post('users')
  async createUsers(@Query('number') number: number) {
    for (let i = 0; i < number; i++) {
      await this.userService.create({
        fullName: `User${i}`,
        email: `user${i}@example.com`,
        password: 'secret',
      });
    }
  }
}
