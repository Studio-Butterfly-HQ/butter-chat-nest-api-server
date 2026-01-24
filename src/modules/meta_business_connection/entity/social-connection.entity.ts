import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { MetaData } from 'src/common/entity/meta-data';
import { v4 as uuidv4 } from 'uuid';

@Entity('social_connections')
export class SocialConnection extends MetaData {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ length: 100 })
  platform_name: string;

  @Column({ length: 100 })
  platform_type: string;

  @Column({ type: 'text' })
  platform_token: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

   @ManyToOne(() => Company, company => company.socialConnections, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}