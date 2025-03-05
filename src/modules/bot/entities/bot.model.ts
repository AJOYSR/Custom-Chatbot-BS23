import { model, Schema, Types } from "mongoose";
import { BotInterface } from "./bot.entity";

const BotSchema = new Schema<BotInterface>(
  {
    _id: {
      type: String,
      auto: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    logo: {
      type: String,
    },
    status: {
      type: String,
      required: true,
    },
    welcomeMessage: {
      type: String,
    },
    fallbackMessage: {
      type: String,
    },
    suggestionMessage: {
      type: String,
    },
    handoverToHuman: {
      type: Boolean,
      default: false,
    },
    systemPrompt: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BotModel = model<BotInterface>("bot", BotSchema);

export { BotModel, BotSchema };
