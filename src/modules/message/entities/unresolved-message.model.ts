import { model, Schema } from 'mongoose';
import { UnresolvedQueryInterface } from './unresolved-message.entity';
import { UNPROCESSED_MESSAGE_STATUS } from 'src/entities/enum.entity';

const UnresolvedQuerySchema = new Schema<UnresolvedQueryInterface>(
  {
    botId: {
      type: String,
      required: true,
      ref: 'conversation',
    },

    conversationId: {
      type: String,
      required: true,
    },

    query: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(UNPROCESSED_MESSAGE_STATUS),
      required: true,
      default: UNPROCESSED_MESSAGE_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const UnresolvedQueryModel = model<UnresolvedQueryInterface>(
  'unresolved-query',
  UnresolvedQuerySchema,
);

export { UnresolvedQueryModel, UnresolvedQuerySchema };
