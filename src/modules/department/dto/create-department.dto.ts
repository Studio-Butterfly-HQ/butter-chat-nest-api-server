import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDepartmentDto {
    @ApiProperty({
        example:'team-alpha',
        description:'department-name'
    })
    @IsString()
    @IsNotEmpty()
    department_name: string

    @ApiProperty({
        example:'engineering and coding',
        description:'description about the department'
    })
    @IsString()
    @IsOptional()
    description?:string

    @IsString()
    @IsOptional()
    department_profile_uri?:string
}