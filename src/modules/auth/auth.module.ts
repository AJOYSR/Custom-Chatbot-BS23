import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { authConfig } from 'src/config/auth';
import { MailService } from 'src/helper/email';

import { APIResponse } from 'src/internal/api-response/api-response.service';
import { JwtStrategy } from 'src/guards/jwt.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: authConfig.jwt_key,
      signOptions: {
        expiresIn: authConfig.expiration_time,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, APIResponse, MailService],
  exports: [AuthService],
})
export class AuthModule {}
