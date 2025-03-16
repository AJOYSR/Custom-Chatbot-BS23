export class CreateUserRequest {
  _id?: string;
  name: string;
  email: string;
  roleId: string;
  phone?: string;
}

export class GetAllUsersQuery {
  name: string;
  email: string;
}

export class User {
  _id?: string;
  email: string;
  password?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  photo?: string;
  role: any;
}
