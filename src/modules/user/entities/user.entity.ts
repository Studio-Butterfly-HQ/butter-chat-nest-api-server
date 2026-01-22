// src/modules/user/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Department } from '../../department/entities/department.entity';
import { MetaData } from 'src/common/entity/meta-data';
import { UserDepartment } from 'src/modules/user-department/entities/user-department.entity';

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

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, nullable: true })
  profile_uri: string;

  @Column({ length: 255, nullable: true })
  bio: string;

  @Column({ name: 'refresh_token', nullable: true })
  refresh_token: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable:false
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

  @OneToMany(() => UserDepartment, userDept => userDept.user)
  userDepartments: UserDepartment[];
}