// src/modules/social-connection/dto/create-social-connection.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';

export class CreateSocialConnectionDto {
  @ApiProperty({
    description: 'Name of the social media platform',
    example: 'Facebook Business',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  platform_name: string;

  @ApiProperty({
    description: 'Type of the social media platform',
    example: 'facebook',
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'telegram'],
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsIn(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'telegram'])
  platform_type: string;

  @ApiProperty({
    description: 'Access token or API key for the platform',
    example: 'EAABwzLixnjYBO...',
  })
  @IsString()
  @IsNotEmpty()
  platform_token: string;
}