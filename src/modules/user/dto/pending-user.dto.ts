// src/modules/user/dto/create-pending-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class PendingUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@company.com',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    description: 'User role in the company',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Department ID to assign the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  department_id: string;
}