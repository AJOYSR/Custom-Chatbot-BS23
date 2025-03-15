import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { User } from 'src/entities/user.entity';

export class UserDto implements User {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  photo: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  role: string;
}

export class UpdatePersonalUserRequestDto implements Partial<User> {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  lastName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  phone: string;

  @ApiProperty({
    description: 'Personal Photo',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  photo: string;
}

export class UserChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @Matches(/^(?=.*[a-z])(?=.*\d).{8,}$/, {
    message: 'validation.passwordComplexity',
  })
  @Matches(/^\S*$/, { message: 'validation.noSpaces' })
  newPassword: string;
}

export class ChangeEmailRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsEmail({}, { message: 'validation.isEmail' })
  email: string;
}

export class VerifyChangeEmailRequestDto extends ChangeEmailRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @IsString({ message: 'validation.isString' })
  code: string;
}

export class GetUserDto {
  @ApiProperty()
  data: UserDto;
}
