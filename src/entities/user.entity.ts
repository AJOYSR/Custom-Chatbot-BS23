export class CreateUserRequest {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  gunRangeId?: string;
  phone?: string;
}

export class GetAllUsersQuery {
  firstName: string;
  lastName: string;
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
