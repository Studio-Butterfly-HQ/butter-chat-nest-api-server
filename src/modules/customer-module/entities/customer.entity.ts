import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Unique
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { MetaData } from 'src/common/entity/meta-data';

/**
 * Enum defining the possible sources where a customer can register from
 */
export enum CustomerSource {
  WEB = 'WEB',
  FACEBOOK = 'FACEBOOK',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  TWITTER = 'TWITTER',
  TELEGRAM = 'TELEGRAM',
  OTHER = 'OTHER'
}

/**
 * Customer Entity
 * Represents a customer who can register through multiple sources
 * Unique constraint is based on company_id, contact, and source combination
 */
@Entity('customers')
@Unique('UQ_customer_company_contact_source', ['company_id', 'contact', 'source'])
export class Customer extends MetaData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key reference to the company
   */
  @Column({ type: 'uuid', nullable: false })
  company_id: string;

  /**
   * Customer name
   */
  @Column({ length: 255, nullable: false })
  name: string;

  /**
   * Profile URI/URL for customer avatar or profile picture
   */
  @Column({ length: 500, nullable: true })
  profile_uri: string;

  /**
   * Contact information - can be email or phone number
   */
  @Column({ length: 255, nullable: false })
  contact: string;

  /**
   * Hashed password for authentication
   */
  @Column({ length: 500, nullable: false })
  password: string;

  /**
   * Source platform where customer registered from
   */
  @Column({
    type: 'enum',
    enum: CustomerSource,
    nullable: false,
    default: CustomerSource.WEB
  })
  source: CustomerSource;

  /**
   * Number of conversations this customer has participated in
   * Defaults to 0 on registration
   */
  @Column({ type: 'int', default: 0, nullable: false })
  conversation_count: number;

  /**
   * Many-to-One relationship with Company
   * A customer belongs to one company
   */
  @ManyToOne(() => Company, company => company.customers, {
    onDelete: 'CASCADE',
    eager: false
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}