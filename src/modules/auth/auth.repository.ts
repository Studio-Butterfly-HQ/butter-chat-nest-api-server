// src/modules/auth/auth.repository.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { LoginAuthDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/registration.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    private dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterCompanyDto) {
    // Check if subdomain already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { subdomain: registerDto.subdomain }
    });

    if (existingCompany) {
      throw new ConflictException('Subdomain already taken');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    //transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Company
      const company = queryRunner.manager.create(Company, {
        company_name: registerDto.company_name,
        subdomain: registerDto.subdomain,
      });
      const savedCompany = await queryRunner.manager.save(Company, company);

      // 2. Hash password and create User (Owner)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
      
      const user = queryRunner.manager.create(User, {
        company_id: savedCompany.id,
        user_name: registerDto.company_name+"_"+"Admin",
        email: registerDto.email,
        password: hashedPassword,
        role: UserRole.OWNER,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return sanitized data
      return {
        user: {
          id: savedUser.id,
          company_id:savedUser.company_id,
          user_name: savedUser.user_name,
          email: savedUser.email,
          role: savedUser.role
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginAuthDto) {
    // Find user by email with company relation
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['company']
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user info with company
    return {
      user: {
        id: user.id,
        company_id:user.company_id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
      }
    };
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email }
    });
  }

  // Find user by ID
  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      select:{id:true,company_id:true,role:true},
    });
  }

  // Find company by subdomain
  async findCompanyBySubdomain(subdomain: string): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { subdomain}
    });
  }

  // Update refresh token
  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { refresh_token: refreshToken }
    );
  }
}