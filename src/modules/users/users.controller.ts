import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Delete,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserAPIDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationResultType } from 'src/utils/types/pagination-result.type';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserAPIDto): Promise<User> {
    if (createProfileDto.password !== createProfileDto.confirmPassword) {
      throw new HttpException('confirmPassword must match password', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.create({
      email: createProfileDto.email,
      password: createProfileDto.password,
      fullName: `${createProfileDto.firstName} ${createProfileDto.lastName}`,
      role: (createProfileDto.canStream) ? RoleEnum.Streamer : RoleEnum.Viewer,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.softDelete(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: RoleEnum })
  async findAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('role', new DefaultValuePipe('')) role: string,
  ): Promise<PaginationResultType<User>> {
    return this.usersService.findManyWithPagination({
      page,
      limit,
      search,
      role,
    });
  }
}
