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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QnAService } from './qna.service';

import { PaginationQueryDto } from '../pagination/types';
import {
  CreateVectorBatchDto,
  CreateVectorDto,
  SearchVectorByQuestionDto,
  SearchVectorDto,
  UpdateVectorDto,
} from './dto/qna.dto';

@ApiTags('Q&A API List')
@Controller('qna')
export class QnAController {
  constructor(private readonly qnaService: QnAService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vector' })
  @ApiResponse({ status: 201, description: 'Vector created successfully' })
  async create(@Body() createVectorDto: CreateVectorDto) {
    return this.qnaService.create(createVectorDto);
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
  async createBatch(@Body() createVectorBatchDto: CreateVectorBatchDto) {
    return this.qnaService.createBatch(createVectorBatchDto);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update a vector' })
  @ApiResponse({ status: 200, description: 'Vector updated successfully' })
  @ApiResponse({ status: 404, description: 'Vector not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVectorDto: UpdateVectorDto,
  ) {
    return this.qnaService.update(id, updateVectorDto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all vectors with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated vectors' })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.qnaService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vector by id' })
  @ApiResponse({ status: 200, description: 'Return a vector by id' })
  @ApiResponse({ status: 404, description: 'Vector not found' })
  async findOne(@Param('id') id: string) {
    return this.qnaService.findOne(id);
  }

  @Post('search/similar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search similar vectors using L2 distance' })
  @ApiResponse({ status: 200, description: 'Return similar vectors' })
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
