import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsEmail({}, { message: 'validation.isEmail' })
  email: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @Matches(/^(?=.*[a-z])(?=.*\d).{8,}$/, {
    message: 'validation.passwordComplexity',
  })
  @Matches(/^\S*$/, { message: 'validation.noSpaces' })
  password: string;
}
