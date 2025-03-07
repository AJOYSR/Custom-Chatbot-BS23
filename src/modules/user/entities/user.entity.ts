import { PERMISSIONS, ROLE } from "src/common/entities/enum.entity";

export interface UserInterface {
  _id?: string;
  email: string;
  password: string;
  role: ROLE;
  permissions: PERMISSIONS[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
