// src/modules/messenger-factory/dto/update-conversation.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateConversationDto } from './create-conversation.dto';

export class UpdateConversationDto extends PartialType(CreateConversationDto) {}