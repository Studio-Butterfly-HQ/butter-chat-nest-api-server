// src/modules/user/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class InvitedUserRegDto {
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
    description: 'User password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'Password@123',
    minLength: 8,
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
//   @Matches(
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
//     { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' }
//   )
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
}