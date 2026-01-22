// src/modules/messenger-factory/dto/create-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { SenderType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Sender identifier',
    example: 'user_123'
  })
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  conversation_id: string;

  @ApiProperty({
    description: 'Type of sender',
    enum: SenderType,
    example: SenderType.HUMAN
  })
  @IsEnum(SenderType)
  @IsNotEmpty()
  sender_type: SenderType;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, I need help with my order'
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Type of message',
    example: 'text'
  })
  @IsString()
  @IsNotEmpty()
  message_type: string;

  @ApiProperty({
    description: 'Whether message has been edited',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  edit_status?: boolean;

  @ApiProperty({
    description: 'ID of message being replied to',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false
  })
  @IsString()
  @IsOptional()
  reply_to_message_id?: string;

  @ApiProperty({
    description: 'Time of message',
    example: '2026-01-12T10:30:00.000Z'
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    description: 'Intent of the message',
    example: 'order_inquiry',
    required: false
  })
  @IsString()
  @IsOptional()
  message_intend?: string;
}