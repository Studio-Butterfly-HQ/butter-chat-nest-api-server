// src/modules/company/company.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async getCompanyByIdWithUser(id: string,userId:string): Promise<Company> {
    const company = await this.companyRepository.findByIdWithUser(id,userId);
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return company;
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    const updated = await this.companyRepository.update(id, updateCompanyDto);
    
    if (!updated) {
      throw new NotFoundException(`Failed to update company with ID ${id}`);
    }
    
    return updated;
  }

  async deleteCompany(id: string): Promise<void> {
    const company = await this.companyRepository.findById(id);
    
    if (!company) {
      throw new NotFoundException(`Company not found`);
    }
    
    await this.companyRepository.delete(id);
  }
}