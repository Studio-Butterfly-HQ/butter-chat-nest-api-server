// src/modules/user/user.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get, Req, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PendingUserDto } from './dto/pending-user.dto';
import { InvitedUserRegDto } from './dto/invited-registration.dto';
import { InvitedUserRegGuard } from './guards/invited-user-reg.guard';

@ApiTags('users')
@Controller('users')
// @ApiBearerAuth() 
// @UseGuards(JwtAuthGuard) 
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
    7. invite user 
  */

  //invite user
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async InviteUser(@Req() req, @Body() inviteUser: PendingUserDto){
    console.log('user invitation controller')
    let res = this.userService.InviteUser(inviteUser,req.companyId)
    return res
  }

  //----add single user----//
  @UseGuards(InvitedUserRegGuard)
  @Post('registration')
  async registerInvitedUser(@Req()req,@Body() invitedUserRegDto:InvitedUserRegDto){
    console.log(req.user)
    return this.userService.registerInvitedUser(invitedUserRegDto,req.user.userId)
  }

  //----add multiple user----//
  @Post('multiple')
  async addMultipleUser(){

  }

  @Patch()
  async updateUser(){

  }

  @Get()
  async userListWithDepartment(){
      
  }

}