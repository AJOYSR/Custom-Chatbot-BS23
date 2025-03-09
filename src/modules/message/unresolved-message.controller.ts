import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { UnresolvedQueryService } from "./unresolved-message.service";
import {
  CreateUnresolvedQueryDto,
  GetUnresolvedQueryListResponseDto,
  UnresolvedQueryResponseDto,
} from "./dto/unsolved-message.dto";

@ApiTags("Unresolved Queries")
@Controller("unresolved-queries")
export class UnresolvedQueryController {
  constructor(
    private readonly unresolvedQueryService: UnresolvedQueryService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new unresolved query" })
  @ApiResponse({
    status: 201,
    description: "Unresolved query successfully created",
    type: UnresolvedQueryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Validation Error",
  })
  async create(
    @Body() createUnresolvedQueryDto: CreateUnresolvedQueryDto
  ): Promise<UnresolvedQueryResponseDto> {
    return this.unresolvedQueryService.create(createUnresolvedQueryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an unresolved query by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "Unique identifier of the unresolved query",
  })
  @ApiResponse({
    status: 200,
    description: "The unresolved query found by ID",
    type: UnresolvedQueryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Unresolved query not found",
  })
  async getById(@Param("id") id: string): Promise<UnresolvedQueryResponseDto> {
    return this.unresolvedQueryService.getById(id);
  }

  @Get()
  @ApiOperation({ summary: "Get a list of unresolved queries with pagination" })
  @ApiResponse({
    status: 200,
    description: "A list of unresolved queries",
    type: GetUnresolvedQueryListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid pagination parameters",
  })
  async getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<GetUnresolvedQueryListResponseDto> {
    return this.unresolvedQueryService.getAll(page, limit);
  }
}
