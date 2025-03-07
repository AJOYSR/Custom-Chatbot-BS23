// message.controller.ts
import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiParam } from "@nestjs/swagger";
import { MessageService } from "./message.service";
import {
  CreateMessageDto,
  GetMessageListResponseDto,
  MessageResponseDto,
} from "./dto/message.dto";

@ApiTags("Messages")
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: "Create a new message" })
  @ApiResponse({
    status: 201,
    description: "Message successfully created",
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Validation Error",
  })
  async create(
    @Body() createMessageDto: CreateMessageDto
  ): Promise<MessageResponseDto> {
    return this.messageService.create(createMessageDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a message by ID" })
  @ApiParam({
    name: "id",
    type: String,
    description: "Unique identifier of the message",
  })
  @ApiResponse({
    status: 200,
    description: "The message found by ID",
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Message not found",
  })
  async getMessageById(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.messageService.getMessageById(id);
  }

  @Get()
  @ApiOperation({ summary: "Get a list of messages with pagination" })
  @ApiResponse({
    status: 200,
    description: "A list of messages",
    type: GetMessageListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid pagination parameters",
  })
  async getMessages(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ): Promise<GetMessageListResponseDto> {
    return this.messageService.getMessages(page, limit);
  }
}
