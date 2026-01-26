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
   * Find all departments for a company with company info and top 10 users (name and email only)
   */
  async findAll(companyId: string) {
    const departments = await this.repository
      .createQueryBuilder('dept')
      //.leftJoinAndSelect('dept.company', 'company')
      .leftJoin('dept.userDepartments', 'ud')
      .leftJoin('ud.user', 'user')
      .addSelect([
        'ud.id',
        'user.id',
        'user.user_name',
        'user.email',
        'user.profile_uri'
      ])
      .where('dept.company_id = :companyId', { companyId })
      .orderBy('dept.createdDate', 'DESC')
      .addOrderBy('ud.assigned_at', 'DESC')
      .getMany();

    // Limit users to top 10 per department
    return departments.map(dept => ({
      ...dept,
      userDepartments: dept.userDepartments?.slice(0, 10) || [],
    }));
  }

  /**
   * Find one department by ID with company info and top 10 users (name and email only)
   */
  async findOne(id: string, companyId: string) {
    const department = await this.repository
      .createQueryBuilder('dept')
      //.leftJoinAndSelect('dept.company', 'company')
      .leftJoin('dept.userDepartments', 'ud')
      .leftJoin('ud.user', 'user')
      .addSelect([
        'ud.id',
        'user.id',
        'user.user_name',
        'user.email',
      ])
      .where('dept.id = :id', { id })
      .andWhere('dept.company_id = :companyId', { companyId })
      .orderBy('ud.assigned_at', 'DESC')
      .getOne();

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Limit users to top 10
    return {
      ...department,
      userDepartments: department.userDepartments?.slice(0, 10) || [],
    };
  }

  /**
   * Create a new department
   */
  async create(companyId: string, createDepartmentDto: CreateDepartmentDto) {
    // Check if department with same name exists in company
    const existingDepartment = await this.repository.findOne({
      where: {
        company_id: companyId,
        department_name: createDepartmentDto.department_name,
      },
    });

    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }

    const department = this.repository.create({
      ...createDepartmentDto,
      company_id: companyId,
      employee_count: 0,
    });

    const savedDepartment = await this.repository.save(department);

    // Fetch with company info
    return this.repository
      .createQueryBuilder('dept')
      //.leftJoinAndSelect('dept.company', 'company')
      .where('dept.id = :id', { id: savedDepartment.id })
      .getOne();
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
      throw new NotFoundException('Department not found');
    }

    // Check for name conflict if name is being updated
    if (
      updateDepartmentDto.department_name &&
      updateDepartmentDto.department_name !== department.department_name
    ) {
      const existingDepartment = await this.repository.findOne({
        where: {
          company_id: companyId,
          department_name: updateDepartmentDto.department_name,
        },
      });

      if (existingDepartment) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    // Update department
    Object.assign(department, updateDepartmentDto);
    await this.repository.save(department);

    // Fetch updated department with company info and top 10 users
    return this.findOne(id, companyId);
  }

  /**
   * Remove a department
   */
  async remove(id: string, companyId: string) {
    const department = await this.repository.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    await this.repository.remove(department);
    return { id, deleted: true };
  }
}