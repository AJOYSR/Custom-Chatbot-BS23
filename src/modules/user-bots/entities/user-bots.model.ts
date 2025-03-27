import { model, Schema } from 'mongoose';
import { UserBots } from './user-bots.entity';

const UserBotsSchema = new Schema<UserBots>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    botId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Bot',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const UserBotsModel = model<UserBots>('userbots', UserBotsSchema);

export { UserBotsModel, UserBotsSchema };
