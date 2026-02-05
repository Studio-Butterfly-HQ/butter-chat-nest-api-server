// src/modules/user/dto/pending-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsArray, IsUUID } from 'class-validator';
import { UserRole } from '../entities/pending-user.entity';

export class PendingUserDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'john.doe@example.com',
    type: String,
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Array of department UUIDs to assign the user to',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43f7-b890-123456789abc'],
    type: [String],
    isArray: true
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  department_ids: string[];

  @ApiProperty({
    description: 'Array of shift UUIDs to assign the user to',
    example: ['456e7890-e89b-12d3-a456-426614174111', '789fcdeb-51a2-43f7-b890-987654321def'],
    type: [String],
    isArray: true
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  shift_ids: string[];
}