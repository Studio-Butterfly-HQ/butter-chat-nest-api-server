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
export class UserController {
  constructor(private readonly userService: UserService) {}

  //invite user
  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async InviteUser(@Req() req, @Body() inviteUser: PendingUserDto) {
    console.log('user invitation controller');
    const res = await this.userService.InviteUser(inviteUser, req.companyId);  // ✅ Added await
    return ResponseUtil.success("invitation sent", res);
  }

  //----add single user----//
  @UseGuards(InvitedUserRegGuard)
  @Post('registration')
  async registerInvitedUser(@Req() req, @Body() invitedUserRegDto: InvitedUserRegDto) {
    console.log(req.user);
    const res = await this.userService.registerInvitedUser(invitedUserRegDto, req.user.userId);  // ✅ Added await
    return ResponseUtil.success("registration successful", res);
  }

  //----add multiple user----//
  @Post('multiple')
  async addMultipleUser() {
    // TODO: implement
  }

  @Get()
  async userListWithDepartment() {
    // TODO: implement
  }

  @UseGuards(JwtAuthGuard)
  @Get('/socket/essential')
  async getSocketEssentials(@Req() req) {
    const userId = req.user.userId;
    const companyId = req.user.companyId;
    const res = await this.userService.getSocketEssentials(userId, companyId);
    console.log(res);
    const socketEssential = { userId, companyId, departments: res };
    return ResponseUtil.success("retrieved successful", socketEssential, "/socket/essential");
  }
}