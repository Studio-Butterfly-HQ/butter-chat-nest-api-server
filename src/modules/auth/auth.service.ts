// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/registration.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository
  ) {}

  async register(registerDto: RegisterCompanyDto) {
    try {
      let result = await this.authRepository.register(registerDto);
      
      const payload = {
        sub: result.user.id,
        companyId: result.user.company_id,
        role: result.user.role,
      };
      
      let accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      let refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      
      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw err;
    }
  }

  async login(loginDto: LoginAuthDto) {
    try {
      let result = await this.authRepository.login(loginDto);
      
      const payload = {
        sub: result.user.id,
        companyId: result.user.company_id,
        role: result.user.role,
      };
      
      let accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      let refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      
      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      throw err;
    }
  }

  async findUserByEmail(email: string) {
    return this.authRepository.findUserByEmail(email);
  }

  async findUserById(userId: string) {
    return this.authRepository.findUserById(userId);
  }

  async findCompanyBySubdomain(subdomain: string) {
    return this.authRepository.findCompanyBySubdomain(subdomain);
  }
}