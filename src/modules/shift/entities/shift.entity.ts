import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MetaData } from 'src/common/entity/meta-data';
import { Company } from 'src/modules/company/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('shifts')
@Index(['companyId', 'shiftName'], { unique: true })
export class Shift extends MetaData {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  shiftName: string;

  @Column({ type: 'time' })
  shiftStartTime: string;

  @Column({ type: 'time' })
  shiftEndTime: string;

  @Column({ type: 'uuid' })
  companyId: string;

  //Relationship
  @ManyToOne(() => Company, (company) => company.shifts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToMany(() => User, user => user.shifts,{
    onDelete: 'CASCADE'
  })
  users: User[];
}
