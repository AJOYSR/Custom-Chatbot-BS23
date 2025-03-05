import { model, Schema } from "mongoose";
import { MessageInterface } from "src/modules/message/entities/message.entity";

const MessageSchema = new Schema<MessageInterface>(
  {
    _id: {
      type: String,
      auto: true,
    },
    sender: {
      type: String,
      enum: ["user", "bot", "human"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MessageModel = model<MessageInterface>("message", MessageSchema);

export { MessageModel, MessageSchema };
