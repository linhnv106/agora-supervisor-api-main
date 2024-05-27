import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { IsExist } from 'src/utils/validators/is-exists.validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'streamer@gmail.com' })
  @Transform(lowerCaseTransformer)
  @Validate(IsExist, ['User'], { message: 'emailNotExists' })
  email: string;

  @ApiProperty({ example: 'secret' })
  @IsNotEmpty()
  password: string;
}
