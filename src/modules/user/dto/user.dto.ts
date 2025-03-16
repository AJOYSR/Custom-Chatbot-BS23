// create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  MinLength,
  Matches,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
import { PERMISSIONS, ROLE } from 'src/entities/enum.entity';
import { PaginationQueryDto } from 'src/modules/pagination/types';

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Smith',
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'validation.isEmail' })
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsString({ message: 'validation.isString' })
  @IsPhoneNumber(null, { message: 'validation.isMobilePhone' })
  phone: string;

  @ApiProperty({
    description:
      'User password (min 8 chars, must contain letters and numbers)',
    example: 'Password123!',
  })
  @IsString({ message: 'validation.isString' })
  @MinLength(8, { message: 'validation.minLength' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'validation.passwordComplexity',
  })
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: ROLE,
    example: ROLE.CUSTOMER,
  })
  @IsEnum(ROLE, { message: 'validation.isEnum' })
  role: ROLE;

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
  })
  @IsArray({ message: 'validation.isArray' })
  @IsEnum(PERMISSIONS, { each: true, message: 'validation.isEnum' })
  permissions: PERMISSIONS[];

  @ApiProperty({
    description: 'User active status',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'validation.isBoolean' })
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'validation.isBoolean' })
  @IsOptional()
  isEmailVerified?: boolean = false;
}

// update-user.dto.ts

export class UpdateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Smith',
    required: false,
  })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'validation.isEmail' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsString({ message: 'validation.isString' })
  @IsPhoneNumber(null, { message: 'validation.isMobilePhone' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description:
      'User password (min 8 chars, must contain letters and numbers)',
    example: 'NewPassword123!',
    required: false,
  })
  @IsString({ message: 'validation.isString' })
  @MinLength(8, { message: 'validation.minLength' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'validation.passwordComplexity',
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'User role',
    enum: ROLE,
    example: ROLE.CUSTOMER,
    required: false,
  })
  @IsEnum(ROLE, { message: 'validation.isEnum' })
  @IsOptional()
  role?: ROLE;

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
    required: false,
  })
  @IsArray({ message: 'validation.isArray' })
  @IsEnum(PERMISSIONS, { each: true, message: 'validation.isEnum' })
  @IsOptional()
  permissions?: PERMISSIONS[];

  @ApiProperty({
    description: 'User active status',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'validation.isBoolean' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
    required: false,
  })
  @IsBoolean({ message: 'validation.isBoolean' })
  @IsOptional()
  isEmailVerified?: boolean;
}

// user-response.dto.ts

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '60d21b4667d0d8992e610c85',
  })
  _id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Smith',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'User role',
    enum: ROLE,
    example: ROLE.CUSTOMER,
  })
  role: ROLE;

  @ApiProperty({
    description: 'User permissions',
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
  })
  permissions: PERMISSIONS[];

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-03-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-03-15T14:30:00.000Z',
  })
  updatedAt: Date;
}

// password-update.dto.ts

export class PasswordUpdateDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
  })
  @IsString({ message: 'validation.isString' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain letters and numbers)',
    example: 'NewPassword123!',
  })
  @IsString({ message: 'validation.isString' })
  @MinLength(8, { message: 'validation.minLength' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'validation.passwordComplexity',
  })
  newPassword: string;
}

export class AddPermissionDto {
  @ApiProperty({
    description: 'Permission to add',
    enum: PERMISSIONS,
    example: PERMISSIONS.VIEW_BOT_LIST,
  })
  @IsEnum(PERMISSIONS, { message: 'validation.isEnum' })
  permission: PERMISSIONS;
}

export class GetAllUserQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  q: string;
}
