import { Injectable } from "@nestjs/common";
import { MessageRepository } from "./message.repository";
import { MessageInterface } from "./entities/message.entity";

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async create(
    messageData: Partial<MessageInterface>
  ): Promise<MessageInterface> {
    return this.messageRepository.create(messageData);
  }

  async findById(id: string): Promise<MessageInterface | null> {
    return this.messageRepository.findById(id);
  }

  async findByConversationId(
    conversationId: string
  ): Promise<MessageInterface[]> {
    return this.messageRepository.findByConversationId(conversationId);
  }

  async update(
    id: string,
    messageData: Partial<MessageInterface>
  ): Promise<MessageInterface | null> {
    return this.messageRepository.update(id, messageData);
  }

  async delete(id: string): Promise<MessageInterface | null> {
    return this.messageRepository.delete(id);
  }
}
