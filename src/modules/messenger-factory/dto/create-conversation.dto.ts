// src/modules/messenger-factory/dto/create-conversation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({
    description: 'Customer name',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({
    description: 'Source of the conversation',
    example: 'whatsapp'
  })
  @IsString()
  @IsNotEmpty()
  conversation_source: string;

  // @ApiProperty({
  //   description: 'Status of the conversation',
  //   example: 'active',
  //   default: 'active'
  // })
  @IsString()
  @IsOptional()
  conversation_status?: string;

  // @ApiProperty({
  //   description: 'Whether conversation is assigned',
  //   example: false,
  //   default: false
  // })
  @IsBoolean()
  @IsOptional()
  assigned_status?: boolean;

  // @ApiProperty({
  //   description: 'ID of the user assigned to this conversation',
  //   example: '123e4567-e89b-12d3-a456-426614174001',
  //   required: false
  // })
  @IsString()
  @IsOptional()
  assigned_to?: string;

  // @ApiProperty({
  //   description: 'Group ID if conversation is part of a group',
  //   example: '123e4567-e89b-12d3-a456-426614174002',
  //   required: false
  // })
  @IsString()
  @IsOptional()
  group_id?: string;

  // @ApiProperty({
  //   description: 'Ending time of the conversation',
  //   example: '2026-01-12T11:00:00.000Z',
  //   required: false
  // })
  @IsString()
  @IsOptional()
  ending_time?: string;
}