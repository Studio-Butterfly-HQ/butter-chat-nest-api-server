import { Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentRepository } from './department.repository';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository:DepartmentRepository){}
  findAll(id:string) {
    return this.departmentRepository.findAll(id);
  }

  //todo(for all req except create): checking a department with that id exists or not for the company

  findOne(id: string,companyId:string) {
    return this.departmentRepository.findOne(id,companyId);
  }

  create(companyId:string, createDepartmentDto: CreateDepartmentDto) {
    return this.departmentRepository.create(companyId,createDepartmentDto);
  }

  update(dept_id: string, updateDepartmentDto: UpdateDepartmentDto,company_id:string) {
    return this.departmentRepository.update(dept_id,updateDepartmentDto,company_id);
  }

  remove(dept_id: string,company_id:string) {
    return this.departmentRepository.remove(dept_id,company_id);
  }
}
