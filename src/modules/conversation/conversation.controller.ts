// conversation.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import {
  ConversationResponseDto,
  CreateConversationDto,
  GetAllConversationQueryDto,
  GetConversationListResponseDto,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { coreConfig } from 'src/config/core';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { RolesGuard } from 'src/guards/roles.guard';
import { PermissionRequired } from 'src/decorators/permission.decorator';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation successfully created',
    type: ConversationResponseDto,
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true }))
    createConversationDto: CreateConversationDto,
  ): Promise<any> {
    return this.conversationService.create(createConversationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @PermissionRequired(PERMISSIONS.VIEW_CONVERSATION_DETAIL)
  @ApiBearerAuth()
  async getConversationById(
    @Param('id') id: string,
  ): Promise<ConversationResponseDto> {
    return this.conversationService.getConversationById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of conversations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'A list of conversations',
    type: GetConversationListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  async getConversations(
    @Query() query: GetAllConversationQueryDto,
  ): Promise<GetConversationListResponseDto> {
    const { page = 1, limit = coreConfig.paginationLimit, ...rest } = query;
    return await this.conversationService.getConversations(rest, {
      page,
      limit,
    });
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @PermissionRequired(PERMISSIONS.VIEW_CONVERSATION_DETAIL)
  @ApiBearerAuth()
  async UpdateConversation(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true }))
    data: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    return this.conversationService.updateConversation(id, data);
  }
}
