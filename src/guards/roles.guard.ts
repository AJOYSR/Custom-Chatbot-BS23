import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import mongoose from 'mongoose';
import { PERMISSIONS_KEY } from 'src/decorators/permission.decorator';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { UnauthorizedErrorMessages } from 'src/entities/messages.entity';

import { UserModel } from 'src/modules/user/entities/user.model';
import { RolePermissionModel } from 'src/modules/user/repository/role-permission.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve the required permission from metadata
    // If any of one is matches then it will permit the user
    const requiredPermissions = this.reflector.get<PERMISSIONS[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permission required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (!user) {
      throw new UnauthorizedException(UnauthorizedErrorMessages.INVALID_USER);
    }

    const { roleId, _id } = user;
    // Fetch user info and permissions
    const [userInfo, permissions] = await Promise.all([
      UserModel.findById(_id).lean(),
      this.getPermissions(roleId?._id, requiredPermissions),
    ]);
    if (!userInfo || !userInfo.isActive) {
      // Throw an UnauthorizedException if user is inactive
      throw new UnauthorizedException(
        UnauthorizedErrorMessages.ACCOUNT_INACTIVE,
      );
    }

    // Check if the user has the required permission
    if (!permissions.length) {
      throw new ForbiddenException(UnauthorizedErrorMessages.ACTION_RESTRICTED);
    }

    return true; // User has the required permission, allow access
  }

  private async getPermissions(
    roleId: string,
    requiredPermissions: string[],
  ): Promise<any[]> {
    try {
      return await RolePermissionModel.aggregate([
        {
          $match: { roleId: new mongoose.Types.ObjectId(roleId) },
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissionId',
            foreignField: '_id',
            as: 'permission',
          },
        },
        {
          $unwind: '$permission',
        },
        {
          $match: {
            'permission.name': { $in: requiredPermissions },
          },
        },
        {
          $project: {
            _id: '$permission._id',
            name: '$permission.name',
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }
}
