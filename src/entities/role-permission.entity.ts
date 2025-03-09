import { Schema } from "mongoose";
import { PERMISSIONS, ROLE } from "./enum.entity";

export class Role {
  _id?: string;
  name: ROLE;
}

export class Permission {
  _id?: string;
  name: PERMISSIONS;
}

export class RolePermission {
  _id?: string;
  roleId: Schema.Types.ObjectId;
  permissionId: Schema.Types.ObjectId;
}
