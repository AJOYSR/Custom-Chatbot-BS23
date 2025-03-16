import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtPayload } from 'src/entities/auth.entity';
import { IResponse } from 'src/internal/api-response/api-response.service';
import { UserInterface } from './entities/user.entity';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { PermissionRequired } from 'src/decorators/permission.decorator';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { GetUserDto } from '../profile/dto/user.dto';
import {
  CreateUserDto,
  GetAllUserQueryDto,
  UpdateUserDto,
} from './dto/user.dto';
import { User as UserInfo } from 'src/decorators/auth.decorator';
import { coreConfig } from 'src/config/core';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @PermissionRequired(PERMISSIONS.CREATE_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: GetUserDto,
  })
  async createUser(
    @UserInfo() user: JwtPayload,
    @Body() createUserDto: CreateUserDto,
  ): Promise<IResponse<UserInterface>> {
    return this.userService.addUser(user, createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @PermissionRequired(PERMISSIONS.VIEW_ADMIN_LIST)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated list of users',
    type: GetUserDto,
  })
  async getAllUsers(
    @UserInfo() user: JwtPayload,
    @Query() query: GetAllUserQueryDto,
  ) {
    const { page = 1, limit = coreConfig.paginationLimit, ...rest } = query;
    return await this.userService.getAllUsers(
      rest,
      {
        page,
        limit,
      },
      user,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @PermissionRequired(PERMISSIONS.VIEW_ADMIN_LIST)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns user details',
    type: GetUserDto,
  })
  async getUserById(
    @UserInfo() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<IResponse<UserInterface>> {
    return this.userService.getUserInfo(user, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @PermissionRequired(PERMISSIONS.UPDATE_ADMIN_STATUS)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: GetUserDto,
  })
  async updateUser(
    @UserInfo() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IResponse<UserInterface>> {
    return this.userService.updateUser(user, updateUserDto, id);
  }
}
