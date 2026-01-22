// src/modules/company/dto/update-company-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CompanyStatus } from '../entities/company.entity';

export class UpdateCompanyStatusDto {
  @ApiProperty({
    example: CompanyStatus.ACTIVE,
    description: 'New company status',
    enum: CompanyStatus
  })
  @IsEnum(CompanyStatus)
  @IsNotEmpty()
  status: CompanyStatus;
}