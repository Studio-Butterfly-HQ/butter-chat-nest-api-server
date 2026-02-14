import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  MinLength,
  MaxLength
} from 'class-validator';

/**
 * DTO for updating customer information
 */
export class UpdateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe Updated',
    required: false,
    minLength: 2,
    maxLength: 255
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Profile URI/URL',
    example: 'https://example.com/new-profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  profile_uri?: string;

  @ApiProperty({
    description: 'Customer password - minimum 8 characters',
    example: 'NewSecurePass123!',
    required: false,
    minLength: 8
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;
}