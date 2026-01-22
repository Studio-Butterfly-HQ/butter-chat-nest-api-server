// src/modules/user/user.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['company']
    });
  }

  async findByIdWithCompany(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['company']
    });
  }

  async findByIdWithDepartments(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['userDepartments', 'userDepartments.department']
    });
  }

  async findAllByCompany(company_id: string): Promise<User[]> {
    return this.find({
      where: { company_id },
      relations: ['userDepartments', 'userDepartments.department'],
      order: { createdDate: 'DESC' }
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }
}