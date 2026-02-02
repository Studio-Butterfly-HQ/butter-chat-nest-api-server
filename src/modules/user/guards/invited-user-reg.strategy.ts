// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  // email: string;
  // companyId: string;
  // role: string;
}

@Injectable()
export class JwtInvitedUserRegStrategy extends PassportStrategy(Strategy,'jwt-invited-user-reg-guard') {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_INVITED_USER_REG') || 'user_invitation_token',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      // email: payload.email,
      // companyId: payload.companyId,
      // role: payload.role,
    };
  }
}