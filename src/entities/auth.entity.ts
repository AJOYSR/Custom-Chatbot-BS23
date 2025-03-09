export class JwtPayload {
  _id: string;
  loginTime: number;
  roleId: { _id: string; name: string };
}

export class Verification {
  contact: string; // email or phone
  token: string;
  expirationTime?: number;
}

export type AdminLoginResponseData =
  | { token: string }
  | { _id: string; name: string; description: string; logo: string };
