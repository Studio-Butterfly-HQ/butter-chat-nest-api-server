// src/modules/company/dto/create-company.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, isEnum, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CompanyStatus } from '../entities/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ 
    example: 'Studio Butterfly', 
    description: 'Company name',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_name: string;

  @ApiProperty({ 
    example: 'butterfly', 
    description: 'Subdomain for company (will be sb.butterchat.io)',
    maxLength: 50,
    minLength: 3
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  subdomain: string;

  @ApiProperty({ 
    example: 'https://example.com/logo.png', 
    description: 'Company logo URL',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  logo?: string;

  @ApiProperty({ 
    example: 'https://example.com/banner.png', 
    description: 'Company banner URL',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  banner?: string;

  @ApiProperty({ 
    example: 'We are a leading provider of innovative solutions', 
    description: 'Company bio/description',
    required: false,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bio?: string;

  @ApiProperty({ 
    example: 'Technology', 
    description: 'Company category/industry',
    required: false,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  company_category?: string;

  @ApiProperty({ 
    example: 'United States', 
    description: 'Company country',
    required: false,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ 
    example: 'en', 
    description: 'Company primary language (ISO 639-1 code)',
    required: false,
    maxLength: 10
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;

  @ApiProperty({ 
    example: 'America/New_York', 
    description: 'Company timezone (IANA timezone format)',
    required: false,
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  timezone?: string;
}