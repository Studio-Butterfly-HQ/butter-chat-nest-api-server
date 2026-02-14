import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { CustomerSource } from '../entities/customer.entity';

/**
 * DTO for customer login
 */
export class LoginCustomerDto {
  @ApiProperty({
    description: 'Contact information - email or phone number',
    example: 'john.doe@example.com'
  })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({
    description: 'Customer password',
    example: 'SecurePass123!'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Registration source platform',
    enum: CustomerSource,
    example: CustomerSource.WEB
  })
  @IsEnum(CustomerSource)
  @IsNotEmpty()
  source: CustomerSource;

  @ApiProperty({
    description: 'Company ID',
    example: '76b8acd6-7796-445d-84be-d83c12a22318'
  })
  @IsString()
  @IsNotEmpty()
  company_id: string;
}