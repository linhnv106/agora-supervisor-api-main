import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class AuthRegisterDto {
  @ApiProperty({ example: 'user1@example.com' })
  @Transform(lowerCaseTransformer)
  @Validate(IsNotExist, ['User'], { message: 'emailAlreadyExists' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret' })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  fullName: string;
}
