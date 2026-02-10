// src/modules/user/user.service.ts
import { Injectable} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { MailService } from '../mail/mail.service';
import { PendingUserDto } from './dto/pending-user.dto';
import { JwtService } from '@nestjs/jwt';
import { InvitedUserRegDto } from './dto/invited-registration.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-pass-dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) {}

  async InviteUser(inviteUser: PendingUserDto, companyId: string) {
    try {
      let savedInvitedUser = await this.userRepository.saveInvitedUser(inviteUser, companyId);
      const payload = {
        sub: savedInvitedUser.id,
      };
      console.log(savedInvitedUser, "saved user info up");
      let invitationToken = this.jwtService.sign(payload, { expiresIn: '1h' });

      this.mailService.sendInvitationEmail(
        savedInvitedUser.email,
        invitationToken,
        'Studio Butterfly'
      );
      return savedInvitedUser.email;
    } catch (err) {
      console.log('error occured for sending mail', err);
      throw err;
    }
  }

  //register invited user 
  async registerInvitedUser(invitedUserRegDto: InvitedUserRegDto, invitationData: string) {
    return this.userRepository.registerInvitedUser(invitedUserRegDto, invitationData);
  }

  async getSocketEssentials(userId: string, companyId: string) {
    return this.userRepository.getSocketEssentials(userId, companyId);
  }

  async getUserListWithDepartments(companyId: string) {
    return this.userRepository.getUserListWithDepartments(companyId);
  }

  async getUserInfoById(userId: string, companyId: string) {
    return this.userRepository.getUserInfoById(userId,companyId)
  }

  async updateUserById(userId: string, companyId: string,udateUserDto: UpdateUserDto) {
    return this.userRepository.updateUserById(userId,companyId, udateUserDto)
  }
  async updatePasswordById(userId: string, companyId: string,udatePasswordDto: UpdatePasswordDto) {
    return this.userRepository.updatePasswordById(userId,companyId, udatePasswordDto)
  }
}