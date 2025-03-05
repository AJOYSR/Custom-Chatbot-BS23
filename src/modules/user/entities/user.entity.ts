import { PERMISSIONS, ROLE } from "src/common/entities/enum.entity";
import { Document } from "mongoose";

export interface UserInterface extends Document {
  email: string;
  password: string;
  role: ROLE;
  permissions: PERMISSIONS[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
