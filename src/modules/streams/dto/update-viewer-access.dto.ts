import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, Validate, ValidateNested } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';
import { IsExist } from 'src/utils/validators/is-exists.validator';

export class ViewerAccessDto {
  @ApiProperty({ type: User })
  @Validate(IsExist, ['User', 'id'], { message: 'userNotExists' })
  @IsNotEmpty()
  user: User;
}

export class UpdateViewerAccessDto {
  @ApiProperty({ type: [ViewerAccessDto] })
  @Type(() => ViewerAccessDto)
  @ValidateNested({ each: true })
  records: ViewerAccessDto[];
}