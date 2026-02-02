// src/modules/user/user.repository.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PendingUser } from './entities/pending-user.entity';
import { PendingUserDto } from './dto/pending-user.dto';
import { InvitedUserRegDto } from './dto/invited-registration.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PendingUser)
    private readonly invitedUserRepository: Repository<PendingUser>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  //------check and save invited user-----///
  async saveInvitedUser(pendingUserDto: PendingUserDto, companyId: string) {
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

    const pendingUser = this.invitedUserRepository.create({
      email: pendingUserDto.email,
      role: pendingUserDto.role,
      company_id: companyId,
      department_id: pendingUserDto.department_id,
      shift_id: pendingUserDto.shift_id,
    });

    return this.invitedUserRepository.save(pendingUser);
  }

  //..register invited user...///
  async registerInvitedUser(invitedUserRegDto: InvitedUserRegDto, invitationData: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Fetch the pending user with their relations
      const pendingUser = await queryRunner.manager.findOne(PendingUser, {
        where: { id: invitationData }, // invitationData = pending user's uuid from the guard
        relations: ['departments', 'shifts'],
      });

      if (!pendingUser) {
        throw new NotFoundException('Invitation not found or already used');
      }

      // 2. Create the new User entity 
      const newUser = queryRunner.manager.create(User, {
        company_id:pendingUser.company_id,
        user_name:invitedUserRegDto.user_name,
        email:pendingUser.email,
        password:await bcrypt.hash(invitedUserRegDto.password, 10),
        profile_uri: invitedUserRegDto.profile_uri,
        bio:invitedUserRegDto.bio,
        role:pendingUser.role,
      });

      // 3. Save the user
      const savedUser = await queryRunner.manager.save(User, newUser);

      // 4. Remove the pending user record
      await queryRunner.manager.remove(PendingUser, pendingUser);

      // 5. Commit
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //-----------------------------------------------------------------------------------------------///

  // async findByEmail(email: string): Promise<User | null> {
  //   return this.findOne({
  //     where: { email },
  //     relations: ['company']
  //   });
  // }

  // async findByIdWithCompany(id: string): Promise<User | null> {
  //   return this.findOne({
  //     where: { id },
  //     relations: ['company']
  //   });
  // }

  // async findByIdWithDepartments(id: string): Promise<User | null> {
  //   return this.findOne({
  //     where: { id },
  //     relations: ['userDepartments', 'userDepartments.department']
  //   });
  // }

  // async findAllByCompany(company_id: string): Promise<User[]> {
  //   return this.find({
  //     where: { company_id },
  //     relations: ['userDepartments', 'userDepartments.department'],
  //     order: { createdDate: 'DESC' }
  //   });
  // }

  // async existsByEmail(email: string): Promise<boolean> {
  //   const count = await this.count({ where: { email } });
  //   return count > 0;
  // }
}