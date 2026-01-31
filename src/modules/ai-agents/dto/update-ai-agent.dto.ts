import { PartialType } from '@nestjs/swagger';
import { CreateAiAgentDto } from './create-ai-agent.dto';

/**
 * DTO for updating an AI agent
 * All fields from CreateAiAgentDto are optional for updates
 */
export class UpdateAiAgentDto extends PartialType(CreateAiAgentDto) {}