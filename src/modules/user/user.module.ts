import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./entities/user.model";
import {
  PermissionSchema,
  RoleSchema,
} from "./repository/role-permission.model";
import { VerificationSchema } from "./repository/verification.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "Role", schema: RoleSchema },
      { name: "Verification", schema: VerificationSchema },
      { name: "Permissions", schema: PermissionSchema },
    ]),
  ],

  controllers: [],
  providers: [],
  exports: [],
})
export class UserModule {}
