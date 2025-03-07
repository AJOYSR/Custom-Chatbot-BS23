import { model, Schema } from "mongoose";
import { BOT_STATUS, SENDER_TYPE } from "src/common/entities/enum.entity";
import { MessageInterface } from "src/modules/message/entities/message.entity";

const MessageSchema = new Schema<MessageInterface>(
  {
    sender: {
      type: String,
      enum: Object.values(SENDER_TYPE),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MessageModel = model<MessageInterface>("message", MessageSchema);

export { MessageModel, MessageSchema };
