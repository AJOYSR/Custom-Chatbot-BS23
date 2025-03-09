import { UNPROCESSED_MESSAGE_STATUS } from "src/entities/enum.entity";

export interface UnresolvedQueryInterface {
  id?: string;
  botId: string;
  conversationId: string;
  query: string;
  status: UNPROCESSED_MESSAGE_STATUS;
  createdAt?: Date;
  updatedAt?: Date;
}
