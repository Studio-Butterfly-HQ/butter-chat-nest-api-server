import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'butterfly Corporation', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_name: string;

  @ApiProperty({ example: 'butterfly', description: 'Subdomain (butterfly.butterchat.io)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  subdomain: string;

  @ApiProperty({ example: 'admin@butterfly.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({ example: '12345678abcdxyz', description: 'Password (min 8 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}