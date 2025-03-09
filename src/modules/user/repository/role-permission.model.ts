import { model, Schema } from "mongoose";
import { PERMISSIONS, ROLE } from "src/entities/enum.entity";
import {
  Permission,
  Role,
  RolePermission,
} from "src/entities/role-permission.entity";

const PermissionSchema = new Schema<Permission>(
  {
    name: {
      type: String,
      required: true,
      enum: PERMISSIONS,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const PermissionModel = model<Permission>("permission", PermissionSchema);
export { PermissionModel, PermissionSchema };

const RoleSchema = new Schema<Role>(
  {
    name: {
      type: String,
      required: true,
      enum: ROLE,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const RoleModel = model<Role>("role", RoleSchema);
export { RoleModel, RoleSchema };

const RolePermissionSchema = new Schema<RolePermission>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "role",
      index: true,
    },
    permissionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "permission",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RolePermissionModel = model<RolePermission>(
  "role-permission",
  RolePermissionSchema
);
export { RolePermissionModel, RolePermissionSchema };
