import { MessageInterface } from "src/modules/message/entities/message.entity";
import { Document } from "mongoose";

export interface ConversationInterface extends Document {
  id: string;
  botId: string;
  userId?: string;
  messages: MessageInterface[];
  startedAt: Date;
  endedAt?: Date;
}
