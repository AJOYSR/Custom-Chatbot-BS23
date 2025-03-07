export interface BotInterface {
  _id?: string;
  name: string;
  description?: string;
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
