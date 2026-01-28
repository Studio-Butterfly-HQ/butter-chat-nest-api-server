import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentRepository {
  constructor(
    @InjectRepository(Department)
    private readonly repository: Repository<Department>,
  ) {}

  /**
   * Find all departments for a company with top 10 users (name and email only)
   */
  async findAll(companyId: string) {
    const departments = await this.repository
      .createQueryBuilder('department')
      .where('department.company_id = :companyId', { companyId })
      .orderBy('department.createdDate', 'DESC')
      .getMany();

    // Fetch limited users for each department
    for (const department of departments) {
      const usersQuery = await this.repository
        .createQueryBuilder('dept')
        .innerJoin('dept.users', 'user')
        .select(['user.id', 'user.user_name', 'user.email'])
        .where('dept.id = :deptId', { deptId: department.id })
        .limit(10)
        .getRawMany();

      department.users = usersQuery.map(u => ({
        id: u.user_id,
        user_name: u.user_user_name,
        email: u.user_email,
      })) as any;
    }

    return departments;
  }

  /**
   * Find one department by ID with top 10 users (name and email only)
   */
  async findOne(id: string, companyId: string) {
    const department = await this.repository
      .createQueryBuilder('department')
      .where('department.id = :id', { id })
      .andWhere('department.company_id = :companyId', { companyId })
      .getOne();

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Fetch top 10 users
    const usersQuery = await this.repository
      .createQueryBuilder('dept')
      .innerJoin('dept.users', 'user')
      .select(['user.id', 'user.user_name', 'user.email'])
      .where('dept.id = :deptId', { deptId: department.id })
      .limit(10)
      .getRawMany();

    department.users = usersQuery.map(u => ({
      id: u.user_id,
      user_name: u.user_user_name,
      email: u.user_email,
    })) as any;

    return department;
  }

  /**
   * Create a new department
   */
  async create(companyId: string, createDepartmentDto: CreateDepartmentDto) {
    // Check if department with same name already exists in company
    const existingDepartment = await this.repository.findOne({
      where: {
        company_id: companyId,
        department_name: createDepartmentDto.department_name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException(
        `Department with name '${createDepartmentDto.department_name}' already exists in this company`,
      );
    }

    const department = this.repository.create({
      ...createDepartmentDto,
      company_id: companyId,
      employee_count: 0,
    });

    return await this.repository.save(department);
  }

  /**
   * Update a department
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    companyId: string,
  ) {
    const department = await this.repository.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if updating name would create a duplicate
    if (updateDepartmentDto.department_name) {
      const existingDepartment = await this.repository.findOne({
        where: {
          company_id: companyId,
          department_name: updateDepartmentDto.department_name,
        },
      });

      if (existingDepartment && existingDepartment.id !== id) {
        throw new ConflictException(
          `Department with name '${updateDepartmentDto.department_name}' already exists in this company`,
        );
      }
    }

    Object.assign(department, updateDepartmentDto);
    
    return await this.repository.save(department);
  }

  /**
   * Remove a department
   */
  async remove(id: string, companyId: string) {
    const department = await this.repository.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    await this.repository.remove(department);
    
    return {
      message: 'Department deleted successfully',
      id,
    };
  }

  /**
   * Update employee count for a department
   */
  async updateEmployeeCount(departmentId: string, companyId: string) {
    const department = await this.repository.findOne({
      where: { id: departmentId, company_id: companyId },
      relations: ['users'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    department.employee_count = department.users?.length || 0;
    
    return await this.repository.save(department);
  }
}