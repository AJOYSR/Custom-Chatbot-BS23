import { model, Schema } from "mongoose";
import { PERMISSIONS, ROLE } from "src/common/entities/enum.entity";
import { UserInterface } from "./user.entity";

const UserSchema = new Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS),
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = model<UserInterface>("user", UserSchema);

export { UserModel, UserSchema };
