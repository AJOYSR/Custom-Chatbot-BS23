/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { authConfig } from 'src/config/auth';
import { mailConfig } from 'src/config/mail';
import { JwtPayload } from 'src/entities/auth.entity';
import {
  AuthErrorMessages,
  AuthSuccessMessages,
  UserErrorMessages,
  UserSuccessMessages,
} from 'src/entities/messages.entity';
import { User } from 'src/entities/user.entity';
import { generateSixDigitCode } from 'src/helper/utils';
import {
  APIResponse,
  IResponse,
} from 'src/internal/api-response/api-response.service';
import { UserInterface } from 'src/modules/user/entities/user.entity';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { getRoleLabel } from 'src/utils';

@Injectable()
export class ProfileService {
  constructor(
    private userRepo: UserRepository,
    private readonly response: APIResponse,
    private readonly i18n: I18nService,
    private userService: UserService,
  ) {}

  /**
   * Retrieves the profile information of the authenticated user.
   * @param user - The authenticated user.
   * @returns A response containing the user's profile information.
   * @throws HttpException if unable to retrieve the user's profile.
   */
  async getMyProfile(user: JwtPayload): Promise<IResponse<UserInterface>> {
    console.log('🚀 ~ ProfileService ~ getMyProfile ~ user:', user);
    const userInfo = await this.userRepo.findUserById(user._id);

    if (!userInfo)
      throw new HttpException(
        { message: UserErrorMessages.COULD_NOT_GET_USER },
        HttpStatus.BAD_REQUEST,
      );

    const getRole = await this.userRepo.findRoleById(userInfo.role);
    if (!getRole) {
      throw new HttpException(
        { message: AuthErrorMessages.INVALID_ROLE_ID },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    userInfo.role = {
      ...getRole,
      label: getRoleLabel(getRole.name),
    };

    (userInfo as any).permissions = await this.userRepo.getPermissionsArray({
      roleId: user?.roleId._id,
    });

    return this.response.success(userInfo);
  }

  /**
   * Updates user information with the provided data.
   * @param userInfo The user information used to identify the user to update.
   * @param data Partial user data containing the fields to update.
   * @param photo the personal photo.
   * @returns A promise resolving to an IResponse containing the updated user information.
   */
  async updateUser(
    userInfo: JwtPayload,
    data: Partial<User>,
    photo?: Express.Multer.File,
  ): Promise<IResponse<User>> {
    const oldInfo = await this.userRepo.findUserById(userInfo._id);
    if (!oldInfo) {
      throw new HttpException(
        { message: UserErrorMessages.COULD_NOT_GET_USER },
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedUser = await this.userRepo.updateUser(
      { _id: userInfo._id },
      { ...data },
    );
    if (!updatedUser) {
      throw new HttpException(
        { message: UserErrorMessages.COULD_NOT_UPDATE_USER },
        HttpStatus.BAD_REQUEST,
      );
    }

    (updatedUser as any).permissions = await this.userRepo.getPermissionsArray({
      roleId: userInfo.roleId._id,
    });

    delete updatedUser.isActive;
    delete updatedUser.isEmailVerified;
    return this.response.success(updatedUser);
  }

  /**
   * Changes the password for the specified user.
   * @param userInfo The information of the user.
   * @param data An object containing the current and new passwords.
   * @returns A success response if the password change is successful.
   * @throws HttpException if an error occurs during the password change process.
   */
  async changePassword(
    userInfo: User,
    data: { currentPassword: string; newPassword: string },
  ) {
    try {
      const { currentPassword, newPassword } = data;

      // Retrieve the user's information including the password hash
      const user = await this.userRepo.getUserPassword({ _id: userInfo._id });
      if (!user) throw new Error(UserErrorMessages.COULD_NOT_GET_USER);

      // Check if the current password matches the stored password hash
      const doesPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!doesPasswordMatch)
        throw new Error(UserErrorMessages.CURRENT_PASSWORD_IS_INCORRECT);

      // Hash the new password
      user.password = await bcrypt.hash(newPassword, authConfig.salt);

      // Update the user's password in the database
      const updatedUser = await this.userRepo.updateUser(
        { _id: user._id },
        user,
      );
      if (!updatedUser)
        throw new Error(UserErrorMessages.FAILED_TO_CHANGE_PASSWORD);

      return this.response.success({
        message: this.i18n.translate(
          AuthSuccessMessages.PASSWORD_CHANGED_SUCCESSFUL,
          {
            lang: I18nContext.current()?.lang,
          },
        ),
      });
    } catch (error: any) {
      throw new HttpException(
        {
          message: error.message || UserErrorMessages.FAILED_TO_CHANGE_PASSWORD,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Sends a verification code to the specified email address for changing the email.
   * @param data An object containing the new email address.
   * @returns A success response if the email change verification code is sent successfully.
   * @throws HttpException if an error occurs during the email change process.
   */
  async changeEmailSendCode(data: { email: string }) {
    try {
      const { email } = data;
      const user = await this.userRepo.findUser({ email });
      if (user) throw new Error(UserErrorMessages.EMAIL_ALREADY_EXISTS);

      // Generate a six-digit verification code
      const code = generateSixDigitCode();
      // Add the verification data to the database
      await this.userRepo.addVerificationData({
        email,
        token: code,
        expirationTime: Date.now() + mailConfig.changeEmail.expirationTime,
      });
      try {
        // Send an email containing the verification code for email change
        this.userService.sendEmail({
          email,
          templatePath: 'dist/helper/email/templates/change-email.html',
          renderValue: { code },
          subject: 'Change Email Request',
        });
      } catch (err) {
        console.log(err);
      }

      return this.response.success({
        message: this.i18n.translate(AuthSuccessMessages.SEND_EMAIL, {
          lang: I18nContext.current()?.lang,
        }),
      });
    } catch (error: any) {
      throw new HttpException(
        {
          message: error.message || UserErrorMessages.FAILED_TO_CHANGE_EMAIL,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Changes the email address for the specified user after verifying the verification code.
   * @param user The information of the user.
   * @param data An object containing the new email address and verification code.
   * @returns A success response if the email address is changed successfully.
   * @throws HttpException if an error occurs during the email change process.
   */
  async changeEmail(user: User, data: { email: string; code: string }) {
    const { email, code } = data;
    // Validate the verification code with the expire time
    const validData = await this.userRepo.findVerificationData({
      token: code,
      expirationTime: { $gt: Date.now() },
    });
    if (!validData || validData.contact !== email)
      throw new HttpException(
        { message: UserErrorMessages.INVALID_CODE },
        HttpStatus.BAD_REQUEST,
      );

    const changesPassword = await this.userRepo.updateUser(
      { _id: user._id },
      {
        email,
      },
    );
    if (!changesPassword)
      throw new HttpException(
        { message: UserErrorMessages.FAILED_TO_CHANGE_EMAIL },
        HttpStatus.BAD_REQUEST,
      );

    // Delete the verification data after successful email change
    this.userRepo.deleteVerificationData({ token: code });
    return this.response.success({
      message: this.i18n.translate(
        UserSuccessMessages.EMAIL_CHANGED_SUCCESSFUL,
        {
          lang: I18nContext.current()?.lang,
        },
      ),
    });
  }
}
