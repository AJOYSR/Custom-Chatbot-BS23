import { Document } from "mongoose";

export interface MessageInterface extends Document {
  id: string;
  sender: "user" | "bot" | "human";
  content: string;
  timestamp: Date;
}
