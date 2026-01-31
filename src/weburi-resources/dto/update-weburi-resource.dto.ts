import { PartialType } from '@nestjs/swagger';
import { CreateWeburiResourceDto } from './create-weburi-resource.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WeburiResourceStatus } from '../entities/weburi-resource.entity';

export class UpdateWeburiResourceDto extends PartialType(CreateWeburiResourceDto) {
  @ApiProperty({ 
    description: 'Status of the resource',
    enum: WeburiResourceStatus,
    example: WeburiResourceStatus.SYNCED,
    required: false
  })
  @IsEnum(WeburiResourceStatus)
  @IsOptional()
  status?: WeburiResourceStatus;
}