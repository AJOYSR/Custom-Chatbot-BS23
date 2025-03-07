import { MessageInterface } from "src/modules/message/entities/message.entity";

export interface ConversationInterface {
  _id?: string;
  botId: any; // normally objectId
  userId?: string;
  messages: MessageInterface[];
  createdAt?: Date;
  updatedAt?: Date;
}
