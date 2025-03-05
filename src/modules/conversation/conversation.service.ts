import { Injectable } from "@nestjs/common";
import { ConversationRepository } from "./conversation.repository";
import { ConversationInterface } from "./entities/conversation.entity";

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository
  ) {}

  async create(
    conversationData: Partial<ConversationInterface>
  ): Promise<ConversationInterface> {
    return this.conversationRepository.create(conversationData);
  }

  async findById(id: string): Promise<ConversationInterface | null> {
    return this.conversationRepository.findById(id);
  }

  async findByBotId(botId: string): Promise<ConversationInterface[]> {
    return this.conversationRepository.findByBotId(botId);
  }

  async findByUserId(userId: string): Promise<ConversationInterface[]> {
    return this.conversationRepository.findByUserId(userId);
  }

  async update(
    id: string,
    conversationData: Partial<ConversationInterface>
  ): Promise<ConversationInterface | null> {
    return this.conversationRepository.update(id, conversationData);
  }

  async delete(id: string): Promise<ConversationInterface | null> {
    return this.conversationRepository.delete(id);
  }
}
