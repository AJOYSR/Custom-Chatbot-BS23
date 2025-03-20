import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QnAService } from './qna.service';

import {
  CreateVectorBatchDto,
  CreateVectorDto,
  GetAlQnaQueryDto,
  SearchVectorByQuestionDto,
  SearchVectorDto,
  UpdateVectorDto,
} from './dto/qna.dto';
import { coreConfig } from 'src/config/core';

import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { PermissionRequired } from 'src/decorators/permission.decorator';

@ApiTags('Q&A API List')
@Controller('qna')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QnAController {
  constructor(private readonly qnaService: QnAService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new qna' })
  @ApiResponse({ status: 201, description: 'Qna created successfully' })
  @PermissionRequired(PERMISSIONS.CREATE_QNA)
  @UseGuards(RolesGuard)
  async create(@Body() createVectorDto: CreateVectorDto) {
    return await this.qnaService.create(createVectorDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple vectors in batch' })
  @ApiResponse({
    status: 201,
    description: 'Vectors created successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        count: { type: 'number' },
        vectors: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @PermissionRequired(PERMISSIONS.CREATE_QNA)
  @UseGuards(RolesGuard)
  async createBatch(@Body() createVectorBatchDto: CreateVectorBatchDto) {
    return this.qnaService.createBatch(createVectorBatchDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Qna' })
  @ApiResponse({ status: 200, description: 'Vector updated successfully' })
  @ApiResponse({ status: 404, description: 'Vector not found' })
  @PermissionRequired(PERMISSIONS.UPDATE_QNA)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateVectorDto: UpdateVectorDto,
  ) {
    return this.qnaService.update(id, updateVectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all qna list with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated qna' })
  @PermissionRequired(PERMISSIONS.VIEW_QNA_LIST)
  @UseGuards(RolesGuard)
  async findAll(@Query() query: GetAlQnaQueryDto) {
    const { page = 1, limit = coreConfig.paginationLimit, ...rest } = query;
    return await this.qnaService.findAll(rest, {
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vector by id' })
  @ApiResponse({ status: 200, description: 'Return a qna by id' })
  @ApiResponse({ status: 404, description: 'Qna not found' })
  @PermissionRequired(PERMISSIONS.VIEW_QNA_DETAIL)
  @UseGuards(RolesGuard)
  async findOne(@Param('id') id: string) {
    return this.qnaService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vector by id' })
  @ApiResponse({
    status: 200,
    description: 'Return a message of fail or success',
  })
  @ApiResponse({ status: 404, description: 'Qna not found' })
  @PermissionRequired(PERMISSIONS.DELETE_QNA)
  @UseGuards(RolesGuard)
  async DeleteQna(@Param('id') id: string) {
    return await this.qnaService.DeleteOne(id);
  }

  @Post('search/similar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search similar Qna using L2 distance' })
  @ApiResponse({ status: 200, description: 'Return similar Qna' })
  async searchSimilar(@Body() searchDto: SearchVectorDto) {
    return this.qnaService.searchSimilar(searchDto);
  }

  @Post('search/cosine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search vectors using cosine similarity' })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by cosine similarity',
  })
  async searchCosine(@Body() searchDto: SearchVectorDto) {
    return this.qnaService.searchCosine(searchDto);
  }

  @Post('search/similar-by-question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search similar vectors using L2 distance based on question',
  })
  @ApiResponse({ status: 200, description: 'Return similar vectors' })
  async searchSimilarByQuestion(@Body() searchDto: SearchVectorByQuestionDto) {
    return this.qnaService.searchSimilarByQuestion(searchDto);
  }

  @Post('search/cosine-by-question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search vectors using cosine similarity based on question',
  })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by cosine similarity',
  })
  async searchCosineByQuestion(@Body() searchDto: SearchVectorByQuestionDto) {
    return this.qnaService.searchCosineByQuestion(searchDto);
  }

  @Post('search/hybrid-by-question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search vectors using hybrid similarity based on question',
  })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by hybrid score',
  })
  async searchHybridByQuestion(@Body() searchDto: SearchVectorByQuestionDto) {
    return this.qnaService.searchHybridByQuestion(searchDto);
  }

  @Post('search/best-by-question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search vectors using hybrid and cosine similarity',
  })
  @ApiResponse({
    status: 200,
    description: 'Return vectors sorted by hybrid score',
  })
  async bestPossibleResult(@Body() searchDto: SearchVectorByQuestionDto) {
    return this.qnaService.searchEnsembleByQuestion(searchDto);
  }
}
