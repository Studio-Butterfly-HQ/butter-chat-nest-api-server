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
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, company_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate shift times if provided
      this.validateShiftTimes(createUserDto.shift_start, createUserDto.shift_end);

      // Check if email already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: createUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Verify department exists and belongs to the same company
      const department = await queryRunner.manager.findOne(Department, {
        where: { 
          id: createUserDto.department_id,
          company_id: company_id
        }
      });

      if (!department) {
        throw new NotFoundException('Department not found or does not belong to your company');
      }

      // Get company information for email
      const company = await queryRunner.manager.findOne(Company, {
        where: { id: company_id }
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      // Store plain password for email (before hashing)
      const plainPassword = createUserDto.password;

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user
      const user = queryRunner.manager.create(User, {
        company_id,
        user_name: createUserDto.user_name,
        email: createUserDto.email,
        password: hashedPassword,
        profile_uri: createUserDto.profile_uri,
        bio: createUserDto.bio,
        role: createUserDto.role,
        status: createUserDto.status,
      });

      const savedUser = await queryRunner.manager.save(User, user);

      // Check if user is already assigned to this department
      const existingAssignment = await queryRunner.manager.findOne(UserDepartment, {
        where: {
          user_id: savedUser.id,
          department_id: createUserDto.department_id
        }
      });

      if (existingAssignment) {
        throw new ConflictException('User is already assigned to this department');
      }

      // Create user-department assignment
      const userDepartment = queryRunner.manager.create(UserDepartment, {
        user_id: savedUser.id,
        department_id: createUserDto.department_id,
        company_id: company_id,
        shift_start: createUserDto.shift_start,
        shift_end: createUserDto.shift_end,
      });

      const savedAssignment = await queryRunner.manager.save(UserDepartment, userDepartment);

      // Generate password reset token (valid for 24 hours)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours validity

      const passwordResetToken = queryRunner.manager.create(PasswordResetToken, {
        user_id: savedUser.id,
        token: hashedResetToken,
        expires_at: expiresAt,
      });

      await queryRunner.manager.save(PasswordResetToken, passwordResetToken);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Send welcome email with credentials and reset token
      // Note: Email sending is async but we don't wait for it to avoid delaying the response
      // Errors in email sending won't affect the user creation
      this.mailService.sendWelcomeEmail(
        savedUser.email,
        savedUser.user_name,
        plainPassword,
        resetToken,
        company.company_name
      ).catch(error => {
        // Log email error but don't throw - user is already created
        console.error('Failed to send welcome email:', error);
      });

      // Remove sensitive data before returning
      const { password, refresh_token, ...userWithoutSensitiveData } = savedUser;

      return {
        ...userWithoutSensitiveData,
        department_assignment: {
          id: savedAssignment.id,
          department_id: savedAssignment.department_id,
          shift_start: savedAssignment.shift_start,
          shift_end: savedAssignment.shift_end,
          assigned_at: savedAssignment.assigned_at,
        }
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find all non-used tokens and check each one
      const resetTokens = await queryRunner.manager.find(PasswordResetToken, {
        where: { used: false },
        relations: ['user']
      });

      let validToken: PasswordResetToken | null = null;

      for (const resetToken of resetTokens) {
        const isValid = await bcrypt.compare(token, resetToken.token);
        if (isValid) {
          validToken = resetToken;
          break;
        }
      }

      if (!validToken) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Check if token has expired
      if (new Date() > validToken.expires_at) {
        throw new BadRequestException('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await queryRunner.manager.update(User, 
        { id: validToken.user_id },
        { password: hashedPassword }
      );

      // Mark token as used
      await queryRunner.manager.update(PasswordResetToken,
        { id: validToken.id },
        { used: true }
      );

      await queryRunner.commitTransaction();

      return { message: 'Password reset successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateShiftTimes(shift_start?: string, shift_end?: string) {
    // If only one is provided, throw error
    if ((shift_start && !shift_end) || (!shift_start && shift_end)) {
      throw new BadRequestException('Both shift_start and shift_end must be provided together');
    }

    // If both provided, validate they're in correct order
    if (shift_start && shift_end) {
      const [startHour, startMin] = shift_start.split(':').map(Number);
      const [endHour, endMin] = shift_end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        throw new BadRequestException('shift_end must be after shift_start');
      }
    }
  }
}