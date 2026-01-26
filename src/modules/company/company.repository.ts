// src/modules/company/company.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByIdWithUser(
    id: string,
    userId: string,
  ): Promise<Company | null> {
    return this.repository
      .createQueryBuilder('company')
      .leftJoin('company.users', 'user')
      .addSelect([
        'user.id',
        'user.user_name',
        'user.email',
        'user.profile_uri',
        'user.role',
      ])
      .where('company.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

    async findById(id: string): Promise<Company | null> {
    return await this.repository.findOne({
      where: { id}
    });
  }

  async update(id: string, updateData: UpdateCompanyDto){
    let res = await this.repository.update(id, updateData);
    return res;
  }

  async delete(id: string): Promise<void> {
    //update required...
    //todo:
    //1. delete all the data available for the company
    await this.repository.delete(id);
  }
}