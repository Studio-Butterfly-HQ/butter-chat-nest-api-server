import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftRepository {
  constructor(
    @InjectRepository(Shift)
    private readonly repository: Repository<Shift>,
  ) {}

  /**
   * Find all shifts for a company with top 10 users (id, name and email only)
   */
  async findAll(companyId: string) {
    const shifts = await this.repository
      .createQueryBuilder('shift')
      .where('shift.companyId = :companyId', { companyId })
      .orderBy('shift.createdDate', 'DESC')
      .getMany();

    // Fetch limited users for each shift
    for (const shift of shifts) {
      const usersQuery = await this.repository
        .createQueryBuilder('shift')
        .innerJoin('shift.users', 'user')
        .select(['user.id', 'user.user_name', 'user.email'])
        .where('shift.id = :shiftId', { shiftId: shift.id })
        .limit(10)
        .getRawMany();

      shift.users = usersQuery.map(u => ({
        id: u.user_id,
        user_name: u.user_user_name,
        email: u.user_email,
      })) as any;
    }

    return shifts;
  }

  /**
   * Find one shift by ID with top 10 users (id, name and email only)
   */
  async findOne(id: string, companyId: string) {
    const shift = await this.repository
      .createQueryBuilder('shift')
      .where('shift.id = :id', { id })
      .andWhere('shift.companyId = :companyId', { companyId })
      .getOne();

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Fetch top 10 users
    const usersQuery = await this.repository
      .createQueryBuilder('shift')
      .innerJoin('shift.users', 'user')
      .select(['user.id', 'user.user_name', 'user.email'])
      .where('shift.id = :shiftId', { shiftId: shift.id })
      .limit(10)
      .getRawMany();

    shift.users = usersQuery.map(u => ({
      id: u.user_id,
      user_name: u.user_user_name,
      email: u.user_email,
    })) as any;

    return shift;
  }

  /**
   * Create a new shift
   */
  async create(companyId: string, createShiftDto: CreateShiftDto) {
    // Validate shift times
    this.validateShiftTimes(createShiftDto.shiftStartTime, createShiftDto.shiftEndTime);

    // Check if shift with same name exists in company
    const existingShift = await this.repository.findOne({
      where: {
        companyId,
        shiftName: createShiftDto.shiftName,
      },
    });

    if (existingShift) {
      throw new ConflictException('Shift with this name already exists');
    }

    // Add seconds to time format (HH:mm:ss)
    const shift = this.repository.create({
      ...createShiftDto,
      companyId,
      shiftStartTime: `${createShiftDto.shiftStartTime}:00`,
      shiftEndTime: `${createShiftDto.shiftEndTime}:00`,
    });

    return this.repository.save(shift);
  }

  /**
   * Update a shift
   */
  async update(id: string, updateShiftDto: UpdateShiftDto, companyId: string) {
    const shift = await this.repository.findOne({
      where: { id, companyId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    // Validate shift times if provided
    if (updateShiftDto.shiftStartTime || updateShiftDto.shiftEndTime) {
      const startTime = updateShiftDto.shiftStartTime || shift.shiftStartTime.substring(0, 5);
      const endTime = updateShiftDto.shiftEndTime || shift.shiftEndTime.substring(0, 5);
      this.validateShiftTimes(startTime, endTime);
    }

    // Check for name conflict if name is being updated
    if (updateShiftDto.shiftName && updateShiftDto.shiftName !== shift.shiftName) {
      const existingShift = await this.repository.findOne({
        where: {
          companyId,
          shiftName: updateShiftDto.shiftName,
        },
      });

      if (existingShift) {
        throw new ConflictException('Shift with this name already exists');
      }
    }

    // Update shift with proper time format
    const updateData: any = { ...updateShiftDto };
    if (updateShiftDto.shiftStartTime) {
      updateData.shiftStartTime = `${updateShiftDto.shiftStartTime}:00`;
    }
    if (updateShiftDto.shiftEndTime) {
      updateData.shiftEndTime = `${updateShiftDto.shiftEndTime}:00`;
    }

    Object.assign(shift, updateData);
    return this.repository.save(shift);
  }

  /**
   * Remove a shift
   */
  async remove(id: string, companyId: string) {
    const shift = await this.repository.findOne({
      where: { id, companyId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    await this.repository.remove(shift);
    return { 
      message: 'Shift deleted successfully',
      id 
    };
  }

  /**
   * Validate that shift end time is after start time
   */
  private validateShiftTimes(startTime: string, endTime: string) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('Shift end time must be after start time');
    }
  }
}