import { Injectable, NotFoundException } from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import {
  ConversationResponseDto,
  CreateConversationDto,
  GetConversationListResponseDto,
} from "./dto/conversation.dto";

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository
  ) {}

  async create(
    createConversationDto: CreateConversationDto
  ): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepository.create(
        createConversationDto
      );
      return { data: conversation };
    } catch (error) {
      throw new Error("Error creating conversation");
    }
  }

  // Get a conversation by ID
  async getConversationById(id: string): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepository.findById(id);
      if (!conversation) {
        throw new NotFoundException(`Conversation with ID ${id} not found`);
      }
      return { data: conversation };
    } catch (error) {
      throw new Error("Error fetching conversation");
    }
  }

  // Get a list of conversations with pagination
  async getConversations(
    page: number,
    limit: number
  ): Promise<GetConversationListResponseDto> {
    try {
      const conversations = await this.conversationRepository.findAll(
        page,
        limit
      );
      const total = await this.conversationRepository.countConversations();

      return {
        total,
        page,
        limit,
        data: conversations,
      };
    } catch (error) {
      throw new Error("Error fetching conversations");
    }
  }
}
