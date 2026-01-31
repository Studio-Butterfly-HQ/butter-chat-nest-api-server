import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Company } from 'src/modules/company/entities/company.entity';
import { MetaData } from 'src/common/entity/meta-data';

export enum WeburiResourceStatus {
  SYNCED = 'SYNCED',
  QUEUED = 'QUEUED',
  FAILED = 'FAILED'
}

@Entity('weburi_resources')
@Unique(['uri', 'company_id'])
export class WeburiResource extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ length: 500 })
  uri: string;

  @Column({
    type: 'enum',
    enum: WeburiResourceStatus,
    default: WeburiResourceStatus.QUEUED
  })
  status: WeburiResourceStatus;

  // Relations
  @ManyToOne(() => Company, (company) => company.weburiResources)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}