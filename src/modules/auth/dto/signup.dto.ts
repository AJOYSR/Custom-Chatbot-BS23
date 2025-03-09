import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEmail } from 'class-validator';
import { MessageResponseDto } from './common.dto';

export class SignupRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsEmail({}, { message: 'validation.isEmail' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @Matches(/^(?=.*[a-z])(?=.*\d).{8,}$/, {
    message: 'validation.passwordComplexity',
  })
  @Matches(/^\S*$/, { message: 'validation.noSpaces' })
  password: string;
}

export class MessageSuccessResponseDto {
  @ApiProperty()
  data: MessageResponseDto;
}
