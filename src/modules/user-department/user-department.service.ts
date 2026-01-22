import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserDepartmentRepository } from './user-department.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Department } from '../department/entities/department.entity';

@Injectable()
export class UserDepartmentService {
  constructor(
    private readonly userDepartmentRepository: UserDepartmentRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async assignUserToDepartment(userId: string, departmentId: string, companyId: string) {
    // Verify user belongs to company
    const user = await this.userRepository.findOne({
      where: { id: userId, company_id: companyId }
    });
    if (!user) {
      throw new NotFoundException('User not found in this company');
    }

    // Verify department belongs to company
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId, company_id: companyId }
    });
    if (!department) {
      throw new NotFoundException('Department not found in this company');
    }

    return await this.userDepartmentRepository.assignUserToDepartment(userId, departmentId, companyId);
  }

  async removeUserFromDepartment(userId: string, departmentId: string, companyId: string) {
    await this.userDepartmentRepository.removeUserFromDepartment(userId, departmentId, companyId);
  }

  async getUserDepartments(userId: string, companyId: string) {
    return await this.userDepartmentRepository.getUserDepartments(userId, companyId);
  }

  async getDepartmentUsers(departmentId: string, companyId: string) {
    return await this.userDepartmentRepository.getDepartmentUsers(departmentId, companyId);
  }
}