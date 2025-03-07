import { model, Schema } from "mongoose";
import { UserInterface } from "./user.entity";

const UserSchema = new Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = model<UserInterface>("user", UserSchema);

export { UserModel, UserSchema };
