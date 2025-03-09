import { model, Schema } from "mongoose";
import { BotInterface } from "./bot.entity";
import { BOT_STATUS } from "src/entities/enum.entity";

const BotSchema = new Schema<BotInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
      enum: Object.values(BOT_STATUS),
      required: true,
      default: BOT_STATUS.ACTIVE,
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
