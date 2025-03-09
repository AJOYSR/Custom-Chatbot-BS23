import { Body, Controller, Get, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  MessageSuccessResponseDto,
  SignupRequestDto,
  SignInDto,
  UserSignInSuccessResponseDto,
  AdminSignInDto,
} from "./dto";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from "./dto/forgot-password.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @ApiResponse({
    description: "User Signup Response",
    type: MessageSuccessResponseDto,
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: "user sign up." })
  async signup(@Body() data: SignupRequestDto) {
    return await this.authService.signup(data);
  }

  @Get("verify-email/:token")
  @ApiOperation({ summary: "verification for email." })
  async verifyEmail(@Param("token") token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post("admin-login")
  @ApiResponse({
    description: "Admin Log In Response",
    type: UserSignInSuccessResponseDto,
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: "Admin login." })
  async adminLogin(@Body() data: AdminSignInDto) {
    return await this.authService.adminLogin(data);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Forgot your password." })
  async forgotPassword(@Body() data: ForgotPasswordRequestDto) {
    return await this.authService.forgotPassword(data.email);
  }

  @Post("reset-password/:token")
  @ApiOperation({ summary: "Reset password." })
  async resetPassword(
    @Param("token") token: string,
    @Body() data: ResetPasswordRequestDto
  ) {
    return await this.authService.resetPassword(token, data);
  }
}
