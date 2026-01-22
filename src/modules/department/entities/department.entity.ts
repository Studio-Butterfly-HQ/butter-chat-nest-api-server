// src/modules/department/entities/department.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { UserDepartment } from "src/modules/user-department/entities/user-department.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity('departments')
@Unique(['company_id', 'department_name'])
export class Department extends MetaData{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: false })
  company_id: string;

  @Column({ name: 'department_name', type: 'varchar', length: 150, nullable: false })
  department_name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'department_profile_uri', type: 'text', nullable: true })
  department_profile_uri?: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => UserDepartment, userDept => userDept.department)
  userDepartments: UserDepartment[];
}