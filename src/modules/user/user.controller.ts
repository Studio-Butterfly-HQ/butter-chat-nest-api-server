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
  /*
    todos:
    1. add a new user         ->  post request
    2. add multiple user      ->  post request

    3. get all users          ->  get request
    4. get a single user      ->  get request
    5. get all users with department

    5. remove a user          ->  delete requst
    6. remove multiple users  ->  delete request

  */

  //----add single user----//
  @Post('single')
  async addOneUser(){

  }

  //----add multiple user----//
  @Post('multiple')
  async addMultipleUser(){

  }

  @Get()
  async userListWithDepartment(){
      
  }

}