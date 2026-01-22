import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentRepository {
  constructor(
    @InjectRepository(Department)
    private readonly departmentDbRepo: Repository<Department>,
  ) {}

  /**
   * Get all departments for a company
   */
  async findAll(companyId: string): Promise<Department[]> {
    return this.departmentDbRepo.find({
      where: { company_id: companyId },
      order: { createdDate: 'DESC' }, 
    });
  }

  /**
   * Get a single department
   */
  async findOne(id: string, companyId: string): Promise<Department> {
    const department = await this.departmentDbRepo.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  /**
   * Create department
   */
  async create(
    companyId: string,
    dto: CreateDepartmentDto,
  ): Promise<Department> {
    try {
      const department = this.departmentDbRepo.create({
        company_id: companyId,
        department_name: dto.department_name,
        description: dto.description,
        department_profile_uri: dto.department_profile_uri,
      });

      return await this.departmentDbRepo.save(department);
    } catch (error) {
      // unique(company_id, department_name)
      if (error.code === '23505') {
        throw new ConflictException(
          'Department with this name already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Update department
   */
  async update(
    id: string,
    dto: UpdateDepartmentDto,
    companyId: string,
  ): Promise<Department> {
    const department = await this.findOne(id, companyId);

    Object.assign(department, dto);

    try {
      return await this.departmentDbRepo.save(department);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Department with this name already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Delete department
   */
  async remove(id: string, companyId: string): Promise<void> {
    const result = await this.departmentDbRepo.delete({
      id,
      company_id: companyId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Department not found');
    }
  }
}
