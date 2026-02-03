// src/modules/user/dto/pending-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsArray, IsUUID } from 'class-validator';
import { UserRole } from '../entities/pending-user.entity';

export class PendingUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  department_ids: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  shift_ids: string[];
}