import { Injectable } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftRepository } from './shift.repository';

@Injectable()
export class ShiftService {

  constructor(private readonly shiftRepository: ShiftRepository){}

  async shiftList(companyId: string) {
    return this.shiftRepository.shiftList(companyId);
  }

  create(companyId:string,createShiftDto: CreateShiftDto) {
    return this.shiftRepository.create(companyId,createShiftDto);
  }

  findAll(companyId:string) {
    return this.shiftRepository.findAll(companyId);
  }

  findOne(companyId:string,id: string) {
    return this.shiftRepository.findOne(id,companyId);
  }

  update(companyId:string,id: string, updateShiftDto: UpdateShiftDto) {
    return this.shiftRepository.update(id,updateShiftDto,companyId);
  }

  remove(companyId:string,id: string) {
    return this.shiftRepository.remove(id,companyId);
  }
}
