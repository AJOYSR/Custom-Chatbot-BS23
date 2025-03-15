import { Message } from 'src/entities/message.entity';

export interface ConversationInterface {
  _id?: string;
  botId: any;
  userId?: string;
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface CreateConversationInterface {
  _id?: string;
  botId: any;
  message: Message;
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
