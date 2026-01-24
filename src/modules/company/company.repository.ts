// src/modules/company/company.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  async findById(id: string): Promise<Company | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async update(id: string, updateData: UpdateCompanyDto): Promise<Company | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    //update required...
    //todo:
    //1. delete all the data available for the company
    await this.repository.delete(id);
  }
}