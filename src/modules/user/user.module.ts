import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.model';
import {
  PermissionSchema,
  RoleSchema,
} from './repository/role-permission.model';
import { VerificationSchema } from './repository/verification.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { MailService } from 'src/helper/email';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { PaginationService } from '../pagination/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Role', schema: RoleSchema },
      { name: 'Verification', schema: VerificationSchema },
      { name: 'Permissions', schema: PermissionSchema },
    ]),
  ],

  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    MailService,
    APIResponse,
    PaginationService,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
