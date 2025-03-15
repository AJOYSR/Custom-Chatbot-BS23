import {
  Controller,
  UseGuards,
  Get,
  HttpStatus,
  Patch,
  Body,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { User as UserInfo } from 'src/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import {
  ChangeEmailRequestDto,
  GetUserDto,
  UpdatePersonalUserRequestDto,
  UserChangePasswordDto,
  VerifyChangeEmailRequestDto,
} from './dto/user.dto';
import { ProfileService } from './profile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/entities/user.entity';
import { JwtPayload } from 'src/entities/auth.entity';

@Controller('profile')
@ApiTags('Personal Profile API')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private userService: ProfileService) {}

  @Get('/me')
  @ApiResponse({
    description: 'Profile Response',
    type: GetUserDto,
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: 'Obtain logged in user information' })
  async getMyProfile(@UserInfo() userInfo: JwtPayload) {
    return await this.userService.getMyProfile(userInfo);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update the profile information of an authenticated user.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async updateUserLocation(
    @UploadedFile() photo: Express.Multer.File,
    @Body(new ValidationPipe({ whitelist: true }))
    data: UpdatePersonalUserRequestDto,
    @UserInfo() user: JwtPayload,
  ) {
    return await this.userService.updateUser(user, data, photo);
  }

  @Patch('/change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @UserInfo() userInfo: User,
    @Body(new ValidationPipe({ whitelist: true })) data: UserChangePasswordDto,
  ) {
    return await this.userService.changePassword(userInfo, data);
  }

  @Post('change-email/send-code')
  @ApiOperation({ summary: 'Send verification code to update email' })
  async changeEmailSendCode(
    @Body(new ValidationPipe({ whitelist: true })) data: ChangeEmailRequestDto,
  ) {
    return await this.userService.changeEmailSendCode(data);
  }

  @Patch('change-email/verify')
  @ApiOperation({ summary: 'Change email (verify)' })
  async changeEmail(
    @UserInfo() userInfo: User,
    @Body(new ValidationPipe({ whitelist: true }))
    data: VerifyChangeEmailRequestDto,
  ) {
    return await this.userService.changeEmail(userInfo, data);
  }
}
