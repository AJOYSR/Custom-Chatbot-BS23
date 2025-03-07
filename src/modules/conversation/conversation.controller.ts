// conversation.controller.ts
import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { ConversationService } from "./conversation.service";
import {
  ConversationResponseDto,
  CreateConversationDto,
  GetConversationListResponseDto,
} from "./dto/conversation.dto";

@ApiTags("Conversations")
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new conversation" })
  @ApiResponse({
    status: 201,
    description: "Conversation successfully created",
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Validation Error",
  })
  async create(
    @Body() createConversationDto: CreateConversationDto
  ): Promise<ConversationResponseDto> {
    return this.conversationService.create(createConversationDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a conversation by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "Unique identifier of the conversation",
  })
  @ApiResponse({
    status: 200,
    description: "The conversation found by ID",
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Conversation not found",
  })
  async getConversationById(
    @Param("id") id: string
  ): Promise<ConversationResponseDto> {
    return this.conversationService.getConversationById(id);
  }

  @Get()
  @ApiOperation({ summary: "Get a list of conversations with pagination" })
  @ApiResponse({
    status: 200,
    description: "A list of conversations",
    type: GetConversationListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid pagination parameters",
  })
  async getConversations(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<GetConversationListResponseDto> {
    return this.conversationService.getConversations(page, limit);
  }
}
