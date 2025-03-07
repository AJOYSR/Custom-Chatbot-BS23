import { Injectable, NotFoundException } from "@nestjs/common";
import { MessageRepository } from "./message.repository";
import {
  CreateMessageDto,
  GetMessageListResponseDto,
  MessageResponseDto,
} from "./dto/message.dto";

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  // Create a message
  async create(
    createMessageDto: CreateMessageDto
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepository.create(createMessageDto);
    return { data: message };
  }

  // Get a message by ID
  async getMessageById(id: string): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return { data: message };
  }

  // Get a list of messages with pagination
  async getMessages(
    page: number,
    limit: number
  ): Promise<GetMessageListResponseDto> {
    const messages = await this.messageRepository.findAll(page, limit);
    const total = await this.messageRepository.countMessages();

    return {
      total,
      page,
      limit,
      data: messages,
    };
  }
}
