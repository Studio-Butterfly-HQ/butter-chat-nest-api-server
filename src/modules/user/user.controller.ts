// src/modules/user/user.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) 
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async func(){
    return 'hello world'
  }
}