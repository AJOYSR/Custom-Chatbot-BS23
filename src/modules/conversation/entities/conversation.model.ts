import { model, Schema } from "mongoose";
import { ConversationInterface } from "./conversation.entity";
import { QUERY_USER_TYPE } from "src/entities/enum.entity";

const ConversationSchema = new Schema<ConversationInterface>(
  {
    botId: {
      type: Schema.Types.ObjectId,
      ref: "bot",
      required: true,
    },

    messages: [
      {
        role: {
          type: String,
          enum: QUERY_USER_TYPE,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
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
