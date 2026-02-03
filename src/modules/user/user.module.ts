// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UserDepartment } from '../user-department/entities/user-department.entity';
import { Department } from '../department/entities/department.entity';
import { Company } from '../company/entities/company.entity';
import { MailModule } from '../mail/mail.module';
import { PendingUser } from './entities/pending-user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtInvitedUserRegStrategy } from './guards/invited-user-reg.strategy';
import { Shift } from '../shift/entities/shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      PasswordResetToken,
      UserDepartment,
      Department, 
      Company,
      PendingUser,
      Shift
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'user_invitation_token',
        signOptions: {
          expiresIn: '30m',
        },
      }),
      inject: [ConfigService],
    }),
    MailModule
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtInvitedUserRegStrategy],
  exports: [UserService, UserRepository]
})
export class UserModule {}