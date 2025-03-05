import { Document } from "mongoose";
export interface BotInterface extends Document {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  logo?: string;
  status: string;
  welcomeMessage?: string;
  fallbackMessage?: string;
  suggestionMessage?: string;
  handoverToHuman?: boolean;
  systemPrompt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
