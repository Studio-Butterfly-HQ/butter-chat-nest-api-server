import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { ShiftRepository } from './shift.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  controllers: [ShiftController],
  providers: [ShiftService,ShiftRepository],
})
export class ShiftModule {}
