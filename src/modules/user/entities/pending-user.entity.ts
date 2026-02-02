// src/modules/user/entities/pending-user.entity.ts

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { MetaData } from 'src/common/entity/meta-data';
import { Company } from 'src/modules/company/entities/company.entity';
import { Shift } from 'src/modules/shift/entities/shift.entity';
import { Department } from 'src/modules/department/entities/department.entity';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  GUEST = 'GUEST'
}

export enum PendingUserStatus {
  PENDING = 'PENDING',
  INVITED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

@Entity('pending_users')
@Unique(['email', 'company_id'])
@Index(['company_id'])
export class PendingUser extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  email: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  department_id: string;

  @Column({ type: 'uuid' })
  shift_id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
  
  @ManyToMany(() => Department, department => department.pending_users, {
      onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'pending_user_departments',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'department_id',
      referencedColumnName: 'id'
    }
  })
  departments: Department[];

    @ManyToMany(() => Shift, shift => shift.pending_users,{
      //cascade: true,
      onDelete: 'CASCADE'
    })
    @JoinTable({
      name: 'pending_user_shifts',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
      },
      inverseJoinColumn: {
        name: 'shift_id',
        referencedColumnName: 'id'
      }
    })
    shifts: Shift[];
  
}