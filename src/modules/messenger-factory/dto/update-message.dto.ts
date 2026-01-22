// src/modules/messenger-factory/dto/update-message.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}