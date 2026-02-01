// src/modules/company/entities/company.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Department } from '../../department/entities/department.entity';
import { MetaData } from 'src/common/entity/meta-data';
import { SocialConnection } from 'src/modules/meta_business_connection/entity/social-connection.entity';
import { Shift } from 'src/modules/shift/entities/shift.entity';
import { AiAgent } from 'src/modules/ai-agents/entities/ai-agent.entity';
import { PendingUser } from 'src/modules/user/entities/pending-user.entity';
import { WeburiResource } from 'src/weburi-resources/entities/weburi-resource.entity';

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

@Entity('companies')
export class Company extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  company_name: string;

  @Column({ length: 50, unique: true })
  subdomain: string;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Column({ length: 255, nullable: true })
  banner: string;

  @Column({ length: 255, nullable: true })
  bio: string;

  @Column({ length: 100, nullable: true })
  company_category: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 10, nullable: true })
  language: string;

  @Column({ length: 50, nullable: true })
  timezone: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CompanyStatus,
    nullable: false,
    default: CompanyStatus.PENDING
  })
  status: CompanyStatus;
  
  // Relations
  @OneToMany(() => User, user => user.company)
  users: User[];

  @OneToMany(() => PendingUser, pendingUser => pendingUser.company)
  pending_users: PendingUser[];

  @OneToMany(() => Department, department => department.company)
  departments: Department[];

  @OneToMany(() => Shift, department => department.company)
  shifts: Shift[];

  @OneToMany(() => SocialConnection, socialConnection => socialConnection.company)
  socialConnections: SocialConnection[];

  @OneToMany(() => WeburiResource, weburiResource => weburiResource.company)
  weburiResources: WeburiResource[];

  @OneToMany(() => AiAgent, (aiAgent) => aiAgent.company)
  ai_agents: AiAgent[];
}