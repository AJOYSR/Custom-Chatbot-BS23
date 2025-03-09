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
