import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, Validate, ValidateNested } from 'class-validator';
import { ViewStatus } from 'src/utils/enums';
import { User } from 'src/modules/users/entities/user.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateStreamDto } from './create-stream.dto';
export class ViewAccessDto {
  @ApiProperty({ default: ViewStatus.Idle })
  @IsNotEmpty()
  status: ViewStatus;

  @ApiProperty({ type: User })
  @Validate(IsExist, ['User', 'id'], { message: 'userNotExists' })
  @IsNotEmpty()
  user: User;
}

export class UpdateStreamAccessDto {
  @ApiProperty({ type: [ViewAccessDto] })
  @Type(() => ViewAccessDto)
  @ValidateNested({ each: true })
  records: ViewAccessDto[];
}

export class UpdateStreamDto extends PartialType(CreateStreamDto) {}
