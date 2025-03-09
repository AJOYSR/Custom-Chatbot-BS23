import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ROLE } from "src/entities/enum.entity";
import { UserService } from "./user.service";
import {
  AddPermissionDto,
  CreateUserDto,
  PasswordUpdateDto,
  UpdateUserDto,
  UserResponseDto,
} from "./dto/user.dto";

@ApiTags("users")
@Controller("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User successfully created",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request - invalid data",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Email is already in use",
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
