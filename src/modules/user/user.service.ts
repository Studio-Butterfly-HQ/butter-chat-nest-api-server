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

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}
}