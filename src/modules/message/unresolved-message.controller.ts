import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UnresolvedQueryService } from './unresolved-message.service';
import {
  CreateUnresolvedQueryDto,
  GetAllUnsolvedQueryDto,
  GetUnresolvedQueryListResponseDto,
  UnresolvedQueryResponseDto,
  UpdateUnresolvedQueryDto,
} from './dto/unsolved-message.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { PermissionRequired } from 'src/decorators/permission.decorator';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { coreConfig } from 'src/config/core';

@ApiTags('Unresolved Queries')
@Controller('unresolved-queries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnresolvedQueryController {
  constructor(
    private readonly unresolvedQueryService: UnresolvedQueryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unresolved query' })
  @ApiResponse({
    status: 201,
    description: 'Unresolved query successfully created',
    type: UnresolvedQueryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation Error',
  })
  async create(
    @Body() createUnresolvedQueryDto: CreateUnresolvedQueryDto,
  ): Promise<UnresolvedQueryResponseDto> {
    return this.unresolvedQueryService.create(createUnresolvedQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an unresolved query by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the unresolved query',
  })
  @ApiResponse({
    status: 200,
    description: 'The unresolved query found by ID',
    type: UnresolvedQueryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Unresolved query not found',
  })
  @PermissionRequired(PERMISSIONS.VIEW_UNRESOLVED_QUERY_DETAIL)
  @UseGuards(RolesGuard)
  async getById(@Param('id') id: string): Promise<UnresolvedQueryResponseDto> {
    return this.unresolvedQueryService.getById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of unresolved queries with pagination' })
  @ApiResponse({
    status: 200,
    description: 'A list of unresolved queries',
    type: GetUnresolvedQueryListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @PermissionRequired(PERMISSIONS.VIEW_UNRESOLVED_QUERY_LIST)
  @UseGuards(RolesGuard)
  async getAll(
    @Query() query: GetAllUnsolvedQueryDto,
  ): Promise<GetUnresolvedQueryListResponseDto> {
    const { page = 1, limit = coreConfig.paginationLimit, ...rest } = query;
    return await this.unresolvedQueryService.getAll(rest, {
      page,
      limit,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an unresolved query by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the unresolved query',
  })
  @ApiResponse({
    status: 200,
    description: 'Unresolved query successfully updated',
    type: UnresolvedQueryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Unresolved query not found',
  })
  @PermissionRequired(PERMISSIONS.UPDATE_UNRESOLVED_QUERY)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUnresolvedQueryDto: UpdateUnresolvedQueryDto,
  ): Promise<UnresolvedQueryResponseDto> {
    return this.unresolvedQueryService.updateStatus(
      id,
      updateUnresolvedQueryDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an unresolved query by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the unresolved query',
  })
  @ApiResponse({
    status: 200,
    description: 'Unresolved query successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Unresolved query not found',
  })
  @PermissionRequired(PERMISSIONS.DELETE_UNRESOLVED_QUERY)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<string> {
    return await this.unresolvedQueryService.deleteById(id);
  }
}
