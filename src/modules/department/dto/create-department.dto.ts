// dto/create-department.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Name of the department',
    example: 'Engineering',
    maxLength: 150,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  department_name: string;

  @ApiProperty({
    description: 'Department description',
    example: 'Software development and engineering team',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL to department profile image',
    example: 'https://example.com/departments/engineering.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  department_profile_uri?: string;
}