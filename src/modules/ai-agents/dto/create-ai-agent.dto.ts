import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsIn, IsBoolean } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAiAgentDto {
    @ApiProperty({
        description: 'The name of the AI agent',
        example: 'Customer Support Agent',
        minLength: 1,
        maxLength: 255
    })
    @IsNotEmpty({ message: 'Agent name is required' })
    @IsString({ message: 'Agent name must be a string' })
    @MinLength(1, { message: 'Agent name must be at least 1 character long' })
    @MaxLength(255, { message: 'Agent name must not exceed 255 characters' })
    agent_name: string;

    @ApiProperty({
        description: 'The personality traits of the AI agent',
        example: 'Friendly and helpful customer service representative who is patient and understanding'
    })
    @IsNotEmpty({ message: 'Personality is required' })
    @IsString({ message: 'Personality must be a string' })
    personality: string;

    @ApiProperty({
        description: 'General instructions for how the AI agent should behave and respond',
        example: 'Assist customers with their inquiries, provide accurate information about products and services, and escalate complex issues to human agents when necessary'
    })
    @IsNotEmpty({ message: 'General instructions are required' })
    @IsString({ message: 'General instructions must be a string' })
    general_instructions: string;

    @ApiPropertyOptional({
        description: 'URL to the avatar image for the AI agent',
        example: 'https://example.com/avatars/agent-avatar.png',
        maxLength: 500
    })
    @IsString({ message: 'Avatar must be a string' })
    @IsOptional()
    @MaxLength(500, { message: 'Avatar URL must not exceed 500 characters' })
    avatar?: string;

    @ApiProperty({
        description: 'What the agent should do when unable to help',
        example: 'transfer_to_human',
        enum: ['transfer_to_human', 'provide_alternatives', 'escalate', 'end_conversation']
    })
    @IsString({ message: 'Choice when unable must be a string' })
    @IsNotEmpty({ message: 'Choice when unable is required' })
    @MaxLength(255, { message: 'Choice when unable must not exceed 255 characters' })
    choice_when_unable: string;

    @ApiProperty({
        description: 'Instructions for when and how to pass the conversation to another agent or human',
        example: 'Transfer the conversation when the customer explicitly requests a human agent or when dealing with complex billing issues'
    })
    @IsNotEmpty({ message: 'Conversation pass instructions are required' })
    @IsString({ message: 'Conversation pass instructions must be a string' })
    conversation_pass_instructions: string;

    @ApiProperty({
        description: 'Whether auto-transfer is enabled or disabled',
        example: 'enabled',
        enum: ['enabled', 'disabled']
    })
    @IsNotEmpty({ message: 'Auto transfer setting is required' })
    @IsString({ message: 'Auto transfer must be a string' })
    @IsIn(['enabled', 'disabled'], { message: 'Auto transfer must be either "enabled" or "disabled"' })
    auto_tranfer: string;

    @ApiProperty({
        description: 'Message to display when transferring the conversation',
        example: 'Please hold while I connect you to a human agent who can better assist you...'
    })
    @IsNotEmpty({ message: 'Transfer connecting message is required' })
    @IsString({ message: 'Transfer connecting message must be a string' })
    transfer_connecting_message: string;

    @ApiPropertyOptional({
        description: 'Whether the AI agent is enabled and active',
        example: true,
        default: true
    })
    @IsBoolean({ message: 'Enabled must be a boolean value' })
    @IsOptional()
    enabled?: boolean;
}