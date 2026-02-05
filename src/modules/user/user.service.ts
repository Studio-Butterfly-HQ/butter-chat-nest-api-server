// src/modules/user/user.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserDepartment } from '../user-department/entities/user-department.entity';
import { Department } from '../department/entities/department.entity';
import { Company } from '../company/entities/company.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import { PendingUserDto } from './dto/pending-user.dto';
import { JwtService } from '@nestjs/jwt';
import { InvitedUserRegDto } from './dto/invited-registration.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
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

}