/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as ejs from 'ejs';
import {
  APIResponse,
  IResponse,
} from 'src/internal/api-response/api-response.service';
import { UserRepository } from './user.repository';
import { PaginationService } from '../pagination/pagination.service';
import { JwtPayload } from 'src/entities/auth.entity';
import { UserInterface } from './entities/user.entity';
import {
  BotErrorMessages,
  UserErrorMessages,
} from 'src/entities/messages.entity';
import { ROLE } from 'src/entities/enum.entity';
import { generateStrongPassword } from 'src/helper/utils';
import { authConfig } from 'src/config/auth';
import { Role } from 'src/entities/role-permission.entity';
import { MailService } from 'src/helper/email';
import { PaginationQueryDto } from '../pagination/types';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BotRepository } from '../bot/bot.repository';
import { UserBotsRepository } from '../user-bots/user-bots.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly response: APIResponse,
    private readonly pagination: PaginationService,
    private readonly botRepo: BotRepository,
    private readonly userBotRepo: UserBotsRepository,
  ) {}

  /**
   * Adds a new user to the system with the provided information.
   * @param userInfo - The user making the request.
   * @param data - Information about the user to be added, including email and role.
   * @returns A response object containing either the newly added user or an error message.
   * @throws HttpException with status BAD_REQUEST if the request is invalid or an error occurs during user creation.
   */
  async addUser(userInfo: JwtPayload, data: CreateUserDto): Promise<any> {
    const { email, role, botId } = data;

    try {
      // Validate creator and target roles
      const [creatorRole, targetRole] = await Promise.all([
        this.userRepo.findRole({ _id: userInfo?.roleId?._id }),
        this.userRepo.findRole({ name: role as ROLE }),
      ]);

      // Ensure creator is a super admin
      if (creatorRole?.name !== ROLE.SUPER_ADMIN) {
        throw new Error(UserErrorMessages.FORBIDDEN_PERMISSION);
      }

      // Validate user and bot
      await this.validateUserAddition(userInfo, email, targetRole?._id);

      // Validate bot
      const validBot = botId && (await this.botRepo.findBotById(botId));
      if (!validBot) throw new Error(BotErrorMessages.INVALID_BOT_ID);

      // Generate and hash temporary password
      const temporaryPassword = generateStrongPassword();
      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        authConfig.salt,
      );

      // Prepare user data
      const newUserData = {
        ...data,
        role: targetRole._id,
        password: hashedPassword,
        isEmailVerified: true,
      };

      // Create user and user-bot relationship
      const addedUser = await this.userRepo.createUser(newUserData);
      if (!addedUser) {
        throw new Error(UserErrorMessages.COULD_NOT_CREATE_USER);
      }

      await this.userBotRepo.create({
        userId: addedUser._id,
        botId,
      });

      // Send temporary password email
      this.sendTemporaryPasswordEmail(email, temporaryPassword);

      return this.response.success(addedUser);
    } catch (error) {
      throw new HttpException(
        { message: error.message || UserErrorMessages.COULD_NOT_CREATE_USER },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private sendTemporaryPasswordEmail(
    email: string,
    temporaryPassword: string,
  ): void {
    this.sendEmail({
      email,
      templatePath: 'src/helper/email/templates/temporary-password.html',
      renderValue: { temporaryPassword },
      subject: 'Your Authentication Details',
    });
  }

  /**
   * Retrieves all retail users based on provided search criteria and pagination parameters.
   * @param condition Search condition containing the query string.
   * @param pagination Pagination parameters for retrieving paginated results.
   * @param user User object representing the requester.
   * @returns A Promise resolving to the paginated list of retail users.
   */
  async getAllUsers(
    condition: { q: string },
    pagination: PaginationQueryDto,
    user: JwtPayload,
    rest = {},
  ) {
    // Generate the search query based on the provided condition
    const query = this.generateSearchQuery(condition);

    // Paginate the list of users based on the generated query, role IDs query, and pagination settings
    const { data, page, limit, total } = await this.pagination.paginate(
      this.userRepo.getAllUsers.bind(this.userRepo),
      this.userRepo.totalUsersCount.bind(this.userRepo),
      {
        ...query,
        ...rest,
      },
      pagination,
    );

    const users: UserInterface[] = [];
    for (const user of data as UserInterface[]) {
      users.push(user);
    }

    // Return a success response containing the paginated list of users
    return this.response.success(users, { page, limit, total });
  }

  /**
   * Retrieves information about a user.
   * @param userInfo The user making the request.
   * @param userId The ID of the user to retrieve information about.
   * @returns A response containing the user information if successful, otherwise throws an error.
   */
  async getUserInfo(
    userInfo: JwtPayload,
    userId: string,
    gunRangeId?: string,
  ): Promise<IResponse<UserInterface>> {
    try {
      // Validates the user permissions.
      await this.validateUserRole(userInfo, userId);
      const roles = await this.userRepo.getRoles({});

      const adminRoles = roles
        .filter((role: Role) =>
          [ROLE.CUSTOMER, ROLE.SUPER_ADMIN].includes(role.name),
        )
        .map((role: Role) => role._id.toString());

      // Find the user by ID
      const user = await this.userRepo.findUserById(userId);

      return this.response.success(user);
    } catch (error) {
      throw new HttpException(
        { message: error.message || UserErrorMessages.COULD_NOT_GET_USER },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Updates an existing user with the provided information.
   * @param userInfo - The user making the request.
   * @param data - Information about the user to be updated, including email and role.
   * @param updatedUserId - The ID of the user to be updated.
   * @returns A response object containing either the updated user or an error message.
   * @throws HttpException with status BAD_REQUEST if the request is invalid or an error occurs during user update.
   */
  async updateUser(
    userInfo: JwtPayload,
    data: UpdateUserDto,
    updatedUserId: string,
  ): Promise<IResponse<UserInterface>> {
    try {
      const { email, role } = data;

      const newRole = await this.userRepo.findRole({ name: role });
      // Validates the user role and checks email
      const [_, updatedUserOldInfo] = await Promise.all([
        await this.validateUserRole(
          userInfo,
          updatedUserId,
          email,
          newRole?._id,
        ),
        await this.userRepo.findUserById(updatedUserId),
      ]);

      if (!updatedUserOldInfo) {
        throw new Error(UserErrorMessages.COULD_NOT_GET_USER);
      }

      if (!newRole) {
        throw new Error(UserErrorMessages.INVALID_ROLE_ID);
      }

      const newData = {
        ...data,
        role: newRole._id, // Use role document's _id
      };

      const updatedUser = await this.userRepo.updateUser(
        { _id: updatedUserId },
        newData,
      );
      if (!updatedUser) throw new Error();

      return this.response.success(updatedUser);
    } catch (error) {
      throw new HttpException(
        { message: error.message || UserErrorMessages.COULD_NOT_UPDATE_USER },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getRoles(user: JwtPayload) {
    try {
      // if (user.roleId?.name !== ROLE.SUPER_ADMIN) {
      //   throw new HttpException(
      //     { message: UserErrorMessages.FORBIDDEN_PERMISSION },
      //     HttpStatus.FORBIDDEN,
      //   );
      // }
      const roles = await this.userRepo.getRoles({});
      return this.response.success(roles);
    } catch (error) {
      throw new HttpException(
        { message: error.message || HttpStatus.INTERNAL_SERVER_ERROR },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Generates a search query based on the conditions provided for retrieving users.
   *
   * @param condition - Query conditions for filtering users.
   * @returns An object representing the search query for users.
   */
  private generateSearchQuery(condition: { q: string }): object {
    const { q } = condition;
    const query: Record<string, any> = {};

    if (q !== undefined && q !== '') {
      query.$or = [{ name: new RegExp(q, 'i') }, { email: q }];
    }
    return query;
  }

  /**
   * Validates the addition of a new user based on various criteria, such as existing email and user permissions.
   * @param userInfo - The user making the request.
   * @param email - The email of the user to be added.
   * @param roleId - The role ID of the user to be added.
   * @param gunRangeId - The role ID of a gun range.
   * @throws HttpException with status BAD_REQUEST if the validation fails.
   */
  private async validateUserAddition(
    userInfo: JwtPayload,
    email: string,
    roleId: string,
  ): Promise<void> {
    try {
      // Check if user exists and role is valid
      const [existingUser, targetRole] = await Promise.all([
        this.userRepo.findUser({ email }),
        this.userRepo.findRoleById(roleId),
      ]);

      // Validate target role
      if (!targetRole) {
        throw new Error(UserErrorMessages.INVALID_ROLE_ID);
      }

      // Check if user already exists
      if (existingUser) {
        throw new HttpException(
          { message: UserErrorMessages.EMAIL_ALREADY_EXISTS },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check user permissions
      const creatorRole = await this.userRepo.findRoleById(
        userInfo?.roleId?._id,
      );
      this.checkUserPermission(creatorRole?.name, targetRole.name);
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async validateUserRole(
    userInfo: JwtPayload,
    userId: string,
    email?: string,
    roleId?: string,
  ): Promise<void> {
    try {
      const [, updatedUserOldInfo, user, targetRole, creatorRole] =
        await Promise.all([
          this.userRepo.findUserById(userInfo._id),
          this.userRepo.findUserById(userId),
          email && this.userRepo.findUser({ email, _id: { $ne: userId } }),
          roleId && this.userRepo.findRoleById(roleId),
          this.userRepo.findRoleById(userInfo?.roleId?._id),
        ]);

      if (roleId && targetRole?.name) {
        // Checks whether a user with a certain role can manage a user with a certain target role.
        this.checkUserPermission(creatorRole.name, targetRole.name);
      }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Checks whether a user with a certain role can manage a user with a certain target role.
   * @param creatorRole - The role of the user making the request.
   * @param targetRole - The target role of the user to be managed.
   * @throws HttpException with status BAD_REQUEST if the user does not have permission to manage the target user.
   */
  private checkUserPermission(creatorRole: ROLE, targetRole: ROLE): void {
    if (!this.canManageUser(creatorRole, targetRole)) {
      throw new HttpException(
        { message: UserErrorMessages.FORBIDDEN_PERMISSION },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Checks if a user with a certain role can manage (add/update) a user with a certain target role.
   * @param creatorRole - The role of the user making the request.
   * @param targetRole - The target role of the user to be managed.
   * @returns True if the user can manage the target user, false otherwise.
   */
  // To check if a user with a certain role can add a user with a certain role
  private canManageUser(creatorRole: ROLE, targetRole: ROLE): boolean {
    switch (creatorRole) {
      case ROLE.SUPER_ADMIN:
        return true; // Super admin can add any role
      default:
        return false;
    }
  }

  /**
   * Sends an email to the specified user with a temporary password.
   * @param data - Information about the email, including recipient, template, temporary password, and subject.
   */
  async sendEmail(data: {
    email: string;
    templatePath: string;
    renderValue: object;
    subject: string;
  }) {
    try {
      const { email, templatePath, subject, renderValue } = data;
      // read the template html file
      const template = fs.readFileSync(templatePath, 'utf8');
      const html = ejs.render(template, renderValue);
      // send the email
      await this.mailService.sendMail(email, subject, html);
    } catch (err) {
      console.log(err);
    }
  }
}
