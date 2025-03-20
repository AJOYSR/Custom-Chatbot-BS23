import { Injectable } from '@nestjs/common';
import { UserInterface } from './entities/user.entity';
import { UserModel } from './entities/user.model';
import { Verification } from 'src/entities/auth.entity';
import { VerificationModel } from './repository/verification.model';
import {
  RoleModel,
  RolePermissionModel,
} from './repository/role-permission.model';
import { Role } from 'src/entities/role-permission.entity';
@Injectable()
export class UserRepository {
  /**
   * Creates a new user in the database.
   * @param data - Partial user data to create a new user.
   * @returns A newly created user object with sensitive information like password removed, or null if an error occurs.
   */
  async createUser(
    data: Partial<UserInterface>,
  ): Promise<UserInterface | null> {
    try {
      const createdUser = await UserModel.create(data);
      const newUser = createdUser?.toJSON();
      delete newUser?.password;
      return newUser;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Retrieves a paginated list of users based on the provided query conditions.
   *
   * @async
   * @param query - The query conditions for filtering users.
   * @param pagination - The pagination parameters, including skip and limit.
   * @returns A Promise resolving to an array of paginated users or an empty array if an error occurs.
   */
  async getAllUsers(
    query: Record<string, any>,
    pagination: { skip: number; limit: number },
  ): Promise<UserInterface[] | null> {
    try {
      // Fetch user roles based on the original query

      // Find users matching the modified query
      const users = await UserModel.find(query)
        .select('-password -isDelete -createdAt -updatedAt')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();

      return users;
    } catch (err) {
      console.error('🚀 ~ UserRepository ~ Error:', err);
      return [];
    }
  }

  /**
   * Retrieves the total count of users based on the provided query conditions.
   *
   * @async
   * @param query - The query conditions for counting users.
   * @returns A Promise resolving to the total count of users or null if an error occurs.
   */

  async totalUsersCount(query: Record<string, any>): Promise<number> {
    try {
      // Return the count of users matching the modified query
      return await UserModel.countDocuments(query);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Adds verification data for email or phone.
   * @param data - Object containing verification data.
   * @returns The verification data object or null if an error occurs.
   */
  async addVerificationData(data: any): Promise<Verification | null> {
    try {
      const { email, phone, ...rest } = data;
      return VerificationModel.findOneAndUpdate(
        { contact: email || phone },
        rest,
        {
          new: true,
          upsert: true,
        },
      ).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Finds verification data based on the provided query.
   * @param query - The query to find verification data.
   * @returns The verification data object or null if not found or an error occurs.
   */
  async findVerificationData(
    query: Record<string, any>,
  ): Promise<Verification | null> {
    try {
      return VerificationModel.findOne(query).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Deletes verification data based on the provided query.
   * @param query - The query to delete verification data.
   * @returns The deleted verification data object or null if not found or an error occurs.
   */
  async deleteVerificationData(
    query: Record<string, any>,
  ): Promise<Verification | null> {
    try {
      return VerificationModel.findOneAndDelete(query).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Finds a user based on the provided query.
   * @param query - The query to find a user.
   * @returns The user object with sensitive information like password removed or null if not found or an error occurs.
   */
  async findUser(query: Record<string, any>): Promise<UserInterface | null> {
    try {
      return await UserModel.findOne(query).select('-password').lean();
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Finds a user by ID.
   * @param id - The ID of the user to find.
   * @returns The user object with sensitive information like password removed or null if not found or an error occurs.
   */
  async findUserById(id: string): Promise<UserInterface | null> {
    try {
      const fetchedUser = await UserModel.findById(id)
        .select('-password -isDelete -createdAt -updatedAt')
        .lean();

      return fetchedUser;
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Retrieves permissions associated with a user's role.
   * @param query - The query to retrieve user permissions.
   * @returns An array of permission objects or null if an error occurs.
   */
  async getPermissionsArray(query: Record<string, any>): Promise<any> {
    try {
      const permissions = await RolePermissionModel.find(query)
        .select('-roleId -_id')
        .populate({
          path: 'permissionId',
          select: 'name _id',
        })
        .lean();

      // Flatten the result array using map
      const flattenedPermissions = permissions.map(
        (permission: any) => permission?.permissionId?.name,
      );
      return flattenedPermissions;
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Finds a role by its ID.
   * @param id - The ID of the role to find.
   * @returns The role object or null if not found or an error occurs.
   */
  async findRoleById(id: string): Promise<Role | null> {
    try {
      return await RoleModel.findById(id).lean();
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Finds a role based on the provided query.
   * @param query - The query to find a role.
   * @returns The role object or null if not found or an error occurs.
   */
  async findRole(query: Partial<Role>): Promise<Role | null> {
    try {
      return await RoleModel.findOne(query).lean();
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Get all roles based on the provided query.
   * @param query - The query to find a role.
   * @returns The role array or empty array if not found or an error occurs.
   */
  async getRoles(query: Partial<Role>): Promise<Role[] | []> {
    try {
      return await RoleModel.find(query).lean();
    } catch (error: any) {
      console.log(error);
      return [];
    }
  }

  /**
   * Retrieves a user's password based on the provided query.
   * @param query - The query to find a user's password.
   * @returns The user object with sensitive information like password or null if not found or an error occurs.
   */
  async getUserPassword(
    query: Record<string, string>,
  ): Promise<UserInterface | null> {
    try {
      return await UserModel.findOne(query);
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  /**
   * Updates a user based on the provided query and data.
   * @param query - The query to find the user to update.
   * @param data - Partial user data to update.
   * @returns The updated user object with sensitive information like password and IDs removed, or null if not found or an error occurs.
   */
  async updateUser(
    query: Record<string, string>,
    data: Partial<UserInterface>,
  ): Promise<UserInterface | null> {
    try {
      return await UserModel.findOneAndUpdate(query, data, {
        new: true,
      })
        .select('-password -isDelete -createdAt -updatedAt')
        .lean();
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }
}
