import { PERMISSIONS } from 'src/entities/enum.entity';

export interface UserInterface {
  _id?: string;
  email: string;
  password: string;
  role: any;
  phone?: string;
  firstName: string;
  lastName: string;
  permissions: PERMISSIONS[];
  botList: any[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
