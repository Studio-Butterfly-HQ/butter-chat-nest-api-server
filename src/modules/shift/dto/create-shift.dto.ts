import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateShiftDto {

  @ApiProperty({
    example: 'Morning Shift',
    description: 'Name of the shift',
  })
  @IsString()
  @IsNotEmpty()
  shiftName: string;

  @ApiProperty({
    example: '09:00',
    description: 'Shift start time (HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'shiftStartTime must be in HH:mm format',
  })
  shiftStartTime: string;

  @ApiProperty({
    example: '17:00',
    description: 'Shift end time (HH:mm)',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'shiftEndTime must be in HH:mm format',
  })
  shiftEndTime: string;
}
