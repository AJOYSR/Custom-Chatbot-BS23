import { SENDER_TYPE } from "src/common/entities/enum.entity";

export interface MessageInterface {
  _id: string;
  sender: SENDER_TYPE;
  content: string;
}
