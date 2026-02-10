// src/modules/user/user.repository.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser, UserRole } from './entities/pending-user.entity';
import { PendingUserDto } from './dto/pending-user.dto';
import { InvitedUserRegDto } from './dto/invited-registration.dto';
import { Department } from '../department/entities/department.entity';
import { Shift } from '../shift/entities/shift.entity';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-pass-dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PendingUser)
    private readonly invitedUserRepository: Repository<PendingUser>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,

    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  //------check and save invited user-----///
  async saveInvitedUser(pendingUserDto: PendingUserDto, companyId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for existing user or pending user
      const [existingUser, existingPendingUser] = await Promise.all([
        this.userRepository.findOne({
          where: { email: pendingUserDto.email, company_id: companyId },
        }),
        this.invitedUserRepository.findOne({
          where: { email: pendingUserDto.email, company_id: companyId },
        }),
      ]);

      if (existingUser) {
        throw new ConflictException('Email already registered as a user');
      }

      if (existingPendingUser) {
        throw new ConflictException('Invitation already sent for this email');
      }

      // Fetch departments and shifts
      const departments = await queryRunner.manager.find(Department, {
        where: { 
          id: In(pendingUserDto.department_ids),
          company_id: companyId 
        },
      });

      const shifts = await queryRunner.manager.find(Shift, {
        where: { 
          id: In(pendingUserDto.shift_ids),
          company_id: companyId 
        },
      });

      if (departments.length !== pendingUserDto.department_ids.length) {
        throw new NotFoundException('One or more departments not found');
      }

      if (shifts.length !== pendingUserDto.shift_ids.length) {
        throw new NotFoundException('One or more shifts not found');
      }

      // Create pending user with relations
      const pendingUser = queryRunner.manager.create(PendingUser, {
        email: pendingUserDto.email,
        role: UserRole.EMPLOYEE,
        company_id: companyId,
        departments,  // Assign the actual entities
        shifts,       // Assign the actual entities
      });

      const savedPendingUser = await queryRunner.manager.save(PendingUser, pendingUser);

      await queryRunner.commitTransaction();

      console.log('saved user info up', savedPendingUser);
      
      return savedPendingUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //..register invited user...///
  async registerInvitedUser(
    invitedUserRegDto: InvitedUserRegDto,
    invitationData: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Fetch pending user with relations
      const pendingUser = await queryRunner.manager.findOne(PendingUser, {
        where: { id: invitationData },
        relations: ['departments', 'shifts'],
      });
      
      if (!pendingUser) {
        throw new NotFoundException('Invitation not found or already used');
      }

      console.log('Pending User:', pendingUser);
      console.log('Departments:', pendingUser.departments);
      console.log('Shifts:', pendingUser.shifts);

      // 2. Create user with all data including relations
      const newUser = queryRunner.manager.create(User, {
        company_id: pendingUser.company_id,
        user_name: invitedUserRegDto.user_name,
        email: pendingUser.email,
        password: await bcrypt.hash(invitedUserRegDto.password, 10),
        profile_uri: invitedUserRegDto.profile_uri,
        bio: invitedUserRegDto.bio,
        role: pendingUser.role,
        departments: pendingUser.departments,  // Copy relations
        shifts: pendingUser.shifts,            // Copy relations
      });

      // 3. Save user (cascade will handle join tables)
      const savedUser = await queryRunner.manager.save(User, newUser);
      console.log('Saved User ID:', savedUser.id);

      // 4. Remove pending user
      await queryRunner.manager.remove(PendingUser, pendingUser);

      // 5. Commit transaction
      await queryRunner.commitTransaction();

      // 6. Fetch complete user
      const completeUser = await this.dataSource.manager.findOne(User, {
        where: { id: savedUser.id },
        relations: ['departments', 'shifts', 'company'],
      });
      
      console.log('Complete User with relations:', completeUser);

      return completeUser;
    } catch (err) {
      console.error('Transaction error:', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //for socket server
  async getSocketEssentials(userId: string, companyId: string) {
    try {
      const departments = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.departments', 'dept')
        .select([
          'dept.id AS department_id',
          'dept.department_name AS department_name'
        ])
        .where('user.id = :userId', { userId })
        .andWhere('user.company_id = :companyId', { companyId })
        .getRawMany();

      return departments;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getUserListWithDepartments(companyId: string) {
    try {
      const users = await this.userRepository.find({
        where: { company_id: companyId },
        relations: ['departments'],
        select: {
          id: true,
          user_name: true,
          email: true,
          profile_uri: true,
          role: true,
          status: true,
        },
        order: {
          createdDate: 'DESC'
        }
      });

      // Transform the response to match the required format
      return users.map(user => ({
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        avatar: user.profile_uri,
        role: user.role,
        status: user.status,
        departments: user.departments.map(dept => ({
          id: dept.id,
          department_name: dept.department_name
        }))
      }));
    } catch (err) {
      console.error('Error fetching user list:', err);
      throw err;
    }
  }

  async getUserInfoById(userId: string, companyId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
      company_id:companyId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserById(
    userId: string,
    companyId: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId, company_id: companyId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);
    // password & refresh_token excluded by select:false
    return this.getUserInfoById(userId, companyId);
  }


    async updatePasswordById(
    userId: string,
    companyId: string,
    dto: UpdatePasswordDto,
  ) {
    // Explicitly fetch password (select:false override)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .andWhere('user.company_id = :companyId', { companyId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Compare old password
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Hash & update new password
    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }


}