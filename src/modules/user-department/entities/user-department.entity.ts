import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  Index, 
  Unique, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate 
} from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import { Department } from 'src/modules/department/entities/department.entity';
import { Company } from 'src/modules/company/entities/company.entity';
import { MetaData } from 'src/common/entity/meta-data';

@Entity('user_departments')
@Unique(['user_id', 'department_id'])
@Index(['company_id'])
@Index(['user_id', 'company_id'])
@Index(['department_id', 'company_id'])
export class UserDepartment extends MetaData{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  department_id: string;

  @Column('uuid')
  company_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company; 

  /**
   * Validate that company_id matches both user and department's company_id
   * This prevents cross-company assignments
   */
  @BeforeInsert()
  @BeforeUpdate()
  async validateCompanyConsistency() {
    // Only validate if relations are loaded
    if (this.user && this.department) {
      // Check user's company matches
      if (this.user.company_id !== this.company_id) {
        throw new BadRequestException(
          `User belongs to company ${this.user.company_id} but assignment is for company ${this.company_id}`
        );
      }

      // Check department's company matches
      if (this.department.company_id !== this.company_id) {
        throw new BadRequestException(
          `Department belongs to company ${this.department.company_id} but assignment is for company ${this.company_id}`
        );
      }

      // Check user and department are in same company
      if (this.user.company_id !== this.department.company_id) {
        throw new BadRequestException(
          `Cannot assign user from company ${this.user.company_id} to department in company ${this.department.company_id}`
        );
      }
    }
  }
}