// create-user.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  MinLength,
  Matches,
} from "class-validator";
import { PERMISSIONS, ROLE } from "src/entities/enum.entity";

export class CreateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @ApiProperty({
    description:
      "User password (min 8 chars, must contain letters and numbers)",
    example: "Password123!",
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: "Password must contain at least one letter and one number",
  })
  password: string;

  @ApiProperty({
    description: "User role",
    enum: ROLE,
    example: ROLE.ADMIN,
  })
  @IsEnum(ROLE, { message: "Invalid role provided" })
  role: ROLE;

  @ApiProperty({
    description: "User permissions",
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
  })
  @IsArray()
  @IsEnum(PERMISSIONS, { each: true, message: "Invalid permission provided" })
  permissions: PERMISSIONS[];

  @ApiProperty({
    description: "User active status",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: "Email verification status",
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean = false;
}

// update-user.dto.ts

export class UpdateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    required: false,
  })
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      "User password (min 8 chars, must contain letters and numbers)",
    example: "NewPassword123!",
    required: false,
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: "Password must contain at least one letter and one number",
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: "User role",
    enum: ROLE,
    example: ROLE.ADMIN,
    required: false,
  })
  @IsEnum(ROLE, { message: "Invalid role provided" })
  @IsOptional()
  role?: ROLE;

  @ApiProperty({
    description: "User permissions",
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
    required: false,
  })
  @IsArray()
  @IsEnum(PERMISSIONS, { each: true, message: "Invalid permission provided" })
  @IsOptional()
  permissions?: PERMISSIONS[];

  @ApiProperty({
    description: "User active status",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Email verification status",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}

// user-response.dto.ts

export class UserResponseDto {
  @ApiProperty({
    description: "User ID",
    example: "60d21b4667d0d8992e610c85",
  })
  _id: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User role",
    enum: ROLE,
    example: ROLE.ADMIN,
  })
  role: ROLE;

  @ApiProperty({
    description: "User permissions",
    type: [String],
    enum: PERMISSIONS,
    isArray: true,
    example: [PERMISSIONS.VIEW_USER_PROFILE, PERMISSIONS.VIEW_BOT_LIST],
  })
  permissions: PERMISSIONS[];

  @ApiProperty({
    description: "User active status",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Email verification status",
    example: true,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: "User creation date",
    example: "2023-03-01T12:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2023-03-15T14:30:00.000Z",
  })
  updatedAt: Date;
}

// password-update.dto.ts

export class PasswordUpdateDto {
  @ApiProperty({
    description: "Current password",
    example: "CurrentPassword123!",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: "New password (min 8 chars, must contain letters and numbers)",
    example: "NewPassword123!",
  })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: "Password must contain at least one letter and one number",
  })
  newPassword: string;
}

export class AddPermissionDto {
  @ApiProperty({
    description: "Permission to add",
    enum: PERMISSIONS,
    example: PERMISSIONS.VIEW_BOT_LIST,
  })
  @IsEnum(PERMISSIONS, { message: "Invalid permission provided" })
  permission: PERMISSIONS;
}
