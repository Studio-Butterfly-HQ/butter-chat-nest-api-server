import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MetaData } from 'src/common/entity/meta-data';
import { Company } from 'src/modules/company/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { PendingUser } from 'src/modules/user/entities/pending-user.entity';

@Entity('shifts')
@Index(['company_id', 'shift_name'], { unique: true })
export class Shift extends MetaData {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  shift_name: string;

  @Column({ type: 'time' })
  shift_start_time: string;

  @Column({ type: 'time' })
  shift_end_time: string;

  @Column({ type: 'uuid' })
  company_id: string;

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

  @ManyToMany(() => PendingUser, pendingUser => pendingUser.shifts, {
    onDelete: 'CASCADE'
  })
  pending_users: PendingUser[];
}
