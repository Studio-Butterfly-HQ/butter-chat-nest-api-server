import { IsString, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeburiResourceDto {
  @ApiProperty({ 
    description: 'URI of the web resource',
    example: 'https://example.com/resource',
    maxLength: 500
  })
  @IsString()
  @IsUrl({}, { message: 'URI must be a valid URL' })
  @MaxLength(500)
  uri: string;
}