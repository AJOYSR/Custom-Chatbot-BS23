import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { authConfig } from 'src/config/auth';
import { UnauthorizedErrorMessages } from 'src/entities/messages.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt_key,
    });
  }

  async validate(payload: any) {
    if (payload === null) {
      throw new UnauthorizedException(UnauthorizedErrorMessages.INVALID_USER);
    }
    return { ...payload };
  }
}
