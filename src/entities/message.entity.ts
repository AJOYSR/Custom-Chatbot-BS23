import { QUERY_USER_TYPE } from "./enum.entity";

export interface Message {
  role: QUERY_USER_TYPE;
  content: string;
  timestamp: Date;
}
