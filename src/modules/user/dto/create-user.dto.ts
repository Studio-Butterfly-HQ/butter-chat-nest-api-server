// src/modules/user/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    maxLength: 50
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  user_name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@company.com',
    maxLength: 50
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'Password@123',
    minLength: 8,
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' }
  )
  password: string;

  @ApiPropertyOptional({
    description: 'Profile image URI',
    example: 'https://example.com/profiles/avatar.jpg',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profile_uri?: string;

  @ApiPropertyOptional({
    description: 'User bio/description',
    example: 'Senior Software Engineer with 5 years of experience',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @ApiProperty({
    description: 'User role in the company',
    enum: UserRole,
    example: UserRole.EMPLOYEE
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Department ID to assign the user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsUUID()
  department_id: string;
}