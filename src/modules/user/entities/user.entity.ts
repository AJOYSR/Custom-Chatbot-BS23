import { PERMISSIONS } from 'src/entities/enum.entity';

export interface UserInterface {
  _id?: string;
  email: string;
  password: string;
  role: any;
  phone?: string;
  name: string;
  permissions: PERMISSIONS[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
