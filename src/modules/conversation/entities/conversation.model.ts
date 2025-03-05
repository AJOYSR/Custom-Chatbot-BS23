import { model, Schema } from "mongoose";
import { ConversationInterface } from "./conversation.entity";

const ConversationSchema = new Schema<ConversationInterface>(
  {
    id: {
      type: String,
      required: true,
    },
    botId: {
      type: String,
      required: true,
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
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
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
