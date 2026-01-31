import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAiAgentDto {
    @IsNotEmpty()
    @IsString()
    agent_name:string

    @IsNotEmpty()
    @IsString()
    personality:string

    @IsNotEmpty()
    @IsString()
    general_instructions:string

    @IsString()
    @IsOptional()
    avatar?:string

    @IsString()
    @IsNotEmpty()
    choice_when_unable?:string

    @IsNotEmpty()
    @IsString()
    conversation_pass_instructions?:string

    @IsNotEmpty()
    @IsString()
    auto_tranfer?:string

    @IsNotEmpty()
    @IsString()
    transfer_connecting_message?:string
}
