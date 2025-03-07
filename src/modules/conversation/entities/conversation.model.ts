import { model, Schema } from "mongoose";
import { ConversationInterface } from "./conversation.entity";

const ConversationSchema = new Schema<ConversationInterface>(
  {
    botId: {
      type: Schema.Types.ObjectId,
      ref: "bot",
    },
    userId: {
      type: String,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "message",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ConversationModel = model<ConversationInterface>(
  "conversation",
  ConversationSchema
);

export { ConversationModel, ConversationSchema };
