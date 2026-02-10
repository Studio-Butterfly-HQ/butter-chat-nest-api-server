// src/modules/user/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { MetaData } from 'src/common/entity/meta-data';
import { Shift } from 'src/modules/shift/entities/shift.entity';
import { Department } from 'src/modules/department/entities/department.entity';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  ONLEAVE = 'ONLEAVE',
  RETIRED = 'RETIRED'
}

@Entity('users')
export class User extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  company_id: string;

  @Column({ length: 50 })
  user_name: string;

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ length: 255 ,select:false})
  password: string;

  @Column({ length: 255, nullable: true })
  profile_uri: string;

  @Column({ length: 255, nullable: true })
  bio: string;

  @Column({ name: 'refresh_token', nullable: true,select:false })
  refresh_token: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  // Relations
  @ManyToOne(() => Company, company => company.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToMany(() => Shift, shift => shift.users, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'user_shifts',
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

  @ManyToMany(() => Department, department => department.users, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'user_departments',
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
}