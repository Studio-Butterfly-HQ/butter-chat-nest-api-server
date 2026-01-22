import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDepartment } from './entities/user-department.entity';

@Injectable()
export class UserDepartmentRepository {
  constructor(
    @InjectRepository(UserDepartment)
    private readonly repository: Repository<UserDepartment>,
  ) {}

  async assignUserToDepartment(userId: string, departmentId: string, companyId: string): Promise<UserDepartment> {
    const existing = await this.checkAssignment(userId, departmentId, companyId);
    if (existing) return existing;

    const assignment = this.repository.create({
      user_id: userId,
      department_id: departmentId,
      company_id: companyId
    });
    return await this.repository.save(assignment);
  }

  async removeUserFromDepartment(userId: string, departmentId: string, companyId: string): Promise<void> {
    await this.repository.delete({
      user_id: userId,
      department_id: departmentId,
      company_id: companyId
    });
  }

  async getUserDepartments(userId: string, companyId: string): Promise<UserDepartment[]> {
    return await this.repository.find({
      where: { user_id: userId, company_id: companyId },
      relations: ['department']
    });
  }

  async getDepartmentUsers(departmentId: string, companyId: string): Promise<UserDepartment[]> {
    return await this.repository.find({
      where: { department_id: departmentId, company_id: companyId },
      relations: ['user']
    });
  }

  async checkAssignment(userId: string, departmentId: string, companyId: string): Promise<UserDepartment | null> {
    return await this.repository.findOne({
      where: { user_id: userId, department_id: departmentId, company_id: companyId }
    });
  }
}