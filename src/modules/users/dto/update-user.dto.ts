import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isEmpty, isNotEmpty } from 'class-validator';
import { Status } from 'src/utils/enums';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  fullName: string | null;

  @ApiProperty({example:'Active'})
  @IsNotEmpty()
  status?: Status | null;

  hash?: string | null;
}


