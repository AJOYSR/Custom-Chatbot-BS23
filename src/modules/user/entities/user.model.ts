import { model, Schema } from 'mongoose';
import { UserInterface } from './user.entity';

const UserSchema = new Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'role',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const UserModel = model<UserInterface>('user', UserSchema);

export { UserModel, UserSchema };
