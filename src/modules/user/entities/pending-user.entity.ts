// src/modules/user/entities/pending-user.entity.ts

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Index,
} from 'typeorm';
import { UserRole } from './user.entity';
import { MetaData } from 'src/common/entity/meta-data';

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

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'uuid' })
  department_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({
    type: 'enum',
    enum: PendingUserStatus,
    default: PendingUserStatus.PENDING,
  })
  status: PendingUserStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Invitation token or verification token',
  })
  invite_token?: string;
}
