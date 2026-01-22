import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailsDto {
  @ApiProperty({ example: 'ERROR_CODE' })
  code: string;

  @ApiProperty({ required: false })
  details?: any;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: ErrorDetailsDto;

  @ApiProperty({ example: '2026-01-05T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ required: false })
  path?: string;
}


export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Data retrieved successfully' })
  message: string;

  @ApiProperty({ type: [Object] })
  data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;

  @ApiProperty({ example: '2026-01-05T00:00:00.000Z' })
  timestamp: string;
}