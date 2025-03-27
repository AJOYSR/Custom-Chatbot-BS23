import { I18nContext, I18nService } from 'nestjs-i18n';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { JwtService } from '@nestjs/jwt';
import { APIResponse } from 'src/internal/api-response/api-response.service';

import { randomUUID } from 'crypto';
import { UserRepository } from '../user/user.repository';
import { UserInterface } from '../user/entities/user.entity';
import { coreConfig } from 'src/config/core';
import { authConfig } from 'src/config/auth';
import { AdminLoginResponseData, JwtPayload } from 'src/entities/auth.entity';
import { MailService } from 'src/helper/email';
import {
  AuthErrorMessages,
  AuthSuccessMessages,
  UnauthorizedErrorMessages,
} from 'src/entities/messages.entity';
import { ROLE } from 'src/entities/enum.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly response: APIResponse,
    private readonly mailService: MailService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Handles user signup, hashing password, creating a new user, and sending a verification email.
   * @param data - Partial user data for signup.
   * @returns Success message on successful signup.
   * @throws HttpException on signup error or existing email.
   */
  async signup(data: Partial<UserInterface>): Promise<{
    data: {
      message: string;
    };
  }> {
    try {
      const { email } = data;
      const [doesUserExist, getCustomerRole] = await Promise.all([
        await this.userRepo.findUser({ email }),
        await this.userRepo.findRole({
          name: ROLE.CUSTOMER,
        }),
      ]);
      console.log(
        '🚀 ~ AuthService ~ signup ~ getCustomerRole:',
        getCustomerRole,
      );

      if (doesUserExist) {
        throw new Error(AuthErrorMessages.EMAIL_ALREADY_EXISTS);
      }

      // Hash the user's password
      data.password = await bcrypt.hash(data.password, authConfig.salt);
      const user = await this.userRepo.createUser({
        ...data,
        role: getCustomerRole?._id,
      });

      if (!user) throw new Error(AuthErrorMessages.SIGNUP_ERROR);

      // Creating a userRoleTable entry for login purposes

      // Send a verification email
      this.sendEmail({
        email: user.email,
        templatePath: 'src/helper/email/templates/verify-email.html',
        url: `${coreConfig.baseUrl}/api/auth/verify-email`,
        subject: 'Confirmation Email',
      });
      return this.response.success({
        message: this.i18n.translate(AuthSuccessMessages.SIGNUP_SUCCESSFUL, {
          lang: I18nContext.current()?.lang,
        }),
      });
    } catch (error) {
      throw new HttpException(
        { message: error.message || AuthErrorMessages.EMAIL_ALREADY_EXISTS },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verifies user email using the provided verification token.
   * @param token - Verification token sent to the user's email.
   * @returns Success message on successful email verification.
   * @throws HttpException on invalid token or verification failure.
   */
  async verifyEmail(token: string): Promise<{
    data: {
      message: string;
    };
  }> {
    const validData = await this.userRepo.findVerificationData({
      token,
    });
    if (!validData)
      throw new HttpException(
        { message: AuthErrorMessages.INVALID_TOKEN },
        HttpStatus.BAD_REQUEST,
      );

    const verifiedUser = await this.userRepo.updateUser(
      { email: validData.contact },
      {
        isEmailVerified: true,
      },
    );
    if (!verifiedUser)
      throw new HttpException(
        { message: AuthErrorMessages.INVALID_TOKEN },
        HttpStatus.BAD_REQUEST,
      );

    this.userRepo.deleteVerificationData({ token });
    return this.response.success({
      message: AuthSuccessMessages.VERIFICATION_SUCCESSFUL,
    });
  }

  /**
   * Resets user password using the provided reset token.
   * @param token - Reset token sent to the user's email.
   * @param data - New password data for resetting.
   * @returns Success message on successful password reset.
   * @throws HttpException on invalid token or password reset failure.
   */
  async resetPassword(
    token: string,
    data: { password: string },
  ): Promise<{
    data: {
      message: string;
    };
  }> {
    const validData = await this.userRepo.findVerificationData({
      token,
      expirationTime: { $gt: Date.now() },
    });
    if (!validData)
      throw new HttpException(
        { message: AuthErrorMessages.INVALID_TOKEN },
        HttpStatus.BAD_REQUEST,
      );

    const hashPassword = await bcrypt.hash(data.password, authConfig.salt);
    const resetPassword = await this.userRepo.updateUser(
      { email: validData.contact },
      {
        password: hashPassword,
      },
    );
    if (!resetPassword)
      throw new HttpException(
        { message: AuthErrorMessages.RESET_PASSWORD_ERROR },
        HttpStatus.BAD_REQUEST,
      );

    this.userRepo.deleteVerificationData({ token });
    return this.response.success({
      message: this.i18n.translate(
        AuthSuccessMessages.PASSWORD_RESET_SUCCESSFUL,
        {
          lang: I18nContext.current()?.lang,
        },
      ),
    });
  }

  /**
   * Initiates the forgot password process, sends a reset email to the user.
   * @param email - User's email for password reset.
   * @returns Success message on successful initiation.
   * @throws HttpException on invalid email.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findUser({ email });

    if (!user)
      throw new HttpException(
        { message: AuthErrorMessages.INVALID_EMAIL },
        HttpStatus.BAD_REQUEST,
      );

    try {
      // Send the email to reset the password
      this.sendEmail({
        email: user.email,
        templatePath: 'src/helper/email/templates/reset-password.html',
        url: `${coreConfig.frontendBaseUrl}/${authConfig.forgotPassword.resetUrl}`,
        subject: 'Reset Password',
        expirationTime: Date.now() + authConfig.forgotPassword.expirationTime,
      });
    } catch (err) {
      console.log(err);
    }
    return this.response.success({
      message: this.i18n.translate(AuthSuccessMessages.SEND_EMAIL, {
        lang: I18nContext.current()?.lang,
      }),
    });
  }

  /**
   * Handles admin login, validates credentials, and generates a JWT token.
   * @param data - Admin credentials for login.
   * @returns JWT token on successful login.
   * @throws HttpException on invalid credentials.
   */
  async adminLogin(data: { email: string; password: string }): Promise<{
    data: AdminLoginResponseData;
  }> {
    try {
      const { email } = data;

      const user = await this.userRepo.getUserPassword({ email });
      if (!user) {
        throw new HttpException(
          { message: AuthErrorMessages.INVALID_CREDENTIALS },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!user.isActive) {
        throw new Error(UnauthorizedErrorMessages.ACCOUNT_INACTIVE);
      }
      const doesUserPasswordMatch = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!doesUserPasswordMatch) throw new Error();
      return this.generateJWTToken(user, user?.role);
    } catch (error) {
      throw new HttpException(
        { message: error.message || AuthErrorMessages.INVALID_CREDENTIALS },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Sends an email to the provided address with the given template and verification link.
   * @param data - Email details including recipient, template, link, subject, and expiration time.
   * @throws Error on email sending failure.
   */
  private async sendEmail(data: {
    email: string;
    templatePath: string;
    url: string;
    subject: string;
    expirationTime?: number;
  }) {
    try {
      const { email, templatePath, url, subject, expirationTime } = data;
      const token = randomUUID();
      const verifyEmailLink = `${url}/${token}`;

      // Read the email template from the specified path
      const template = fs.readFileSync(templatePath, 'utf8');
      // Render the email template with the verification link
      const html = ejs.render(template, { url: verifyEmailLink });

      // Add verification data to the database, including the email, token, and expiration time (if provided)
      await this.userRepo.addVerificationData({
        email,
        token,
        ...(expirationTime && { expirationTime }),
      });

      // Send the email using the MailService, including the recipient email, subject, and HTML content
      await this.mailService.sendMail(email, subject, html);
    } catch (err) {
      console.log(err);
    }
  }
  // Helper function to handle non-Range Admin login

  generateJWTToken(user: any, roleId: any): any {
    const payload: JwtPayload = {
      _id: user._id,
      loginTime: Date.now(),
      roleId: {
        _id: roleId?._id,
        name: roleId?.name,
      },
    };

    const token = this.jwtService.sign(payload);
    return this.response.success({ token });
  }
}
