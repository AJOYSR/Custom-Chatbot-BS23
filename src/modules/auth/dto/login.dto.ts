import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { TokenResponseDto } from './common.dto';

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  @IsEmail({}, { message: 'validation.isEmail' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  password: string;
}

export class AdminSignInDto extends SignInDto {}

export class UserSignInSuccessResponseDto {
  @ApiProperty()
  data: TokenResponseDto;
}
