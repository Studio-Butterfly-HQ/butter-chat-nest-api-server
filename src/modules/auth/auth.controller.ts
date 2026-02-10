// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/registration.dto';
import { ResponseUtil } from '../../common/utils/response.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company with owner account' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    schema: {
      example: {
        success: true,
        message: 'Registration successful',
        data: {
          accessToken:"Generated AccessToken"
        },
        timestamp: '2026-01-05T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Conflict - subdomain or email already exists' })
  async register(@Body() registerDto: RegisterCompanyDto, @Res({passthrough:true}) res) {
    console.log("Registration data: ",registerDto)
    const result = await this.authService.register(registerDto);
    res.cookie('refreshToken',result.refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge: 7*24*60*60*1000 //15 days
    })
    return ResponseUtil.created('Registration successful', {accessToken:result.accessToken});
  }
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          accessToken:"Generated AccessToken"
        },
        timestamp: '2026-01-05T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  async login(@Body() loginDto: LoginAuthDto,@Res({passthrough:true}) res) {
    console.log("Login Data: ",loginDto)
    const result = await this.authService.login(loginDto);
      res.cookie('refreshToken',result.refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge: 7*24*60*60*1000
    })
    return ResponseUtil.created('Login successful', {accessToken:result.accessToken});
  }
}