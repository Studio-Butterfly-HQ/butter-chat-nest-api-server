import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional, 
  MinLength,
  MaxLength
} from 'class-validator';
import { CustomerSource } from '../entities/customer.entity';

/**
 * DTO for customer registration
 */
export class RegisterCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Contact information - email or phone number',
    example: 'john.doe@example.com',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contact: string;

  @ApiProperty({
    description: 'Customer password',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Registration source platform',
    enum: CustomerSource,
    example: CustomerSource.WEB,
    default: CustomerSource.WEB
  })
  @IsEnum(CustomerSource)
  @IsOptional()
  source?: CustomerSource;

  @ApiProperty({
    description: 'Profile URI/URL',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_uri?: string;

  @ApiProperty({
    description: 'Company ID',
    example: '76b8acd6-7796-445d-84be-d83c12a22318'
  })
  @IsString()
  @IsNotEmpty()
  company_id: string;
}