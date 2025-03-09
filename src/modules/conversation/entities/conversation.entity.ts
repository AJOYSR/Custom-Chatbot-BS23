import { Message } from "src/entities/message.entity";

export interface ConversationInterface {
  _id?: string;
  botId: any; // normally objectId
  messages: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}
