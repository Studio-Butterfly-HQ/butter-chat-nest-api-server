// src/modules/department/entities/department.entity.ts
import { MetaData } from "src/common/entity/meta-data";
import { Company } from "src/modules/company/entities/company.entity";
import { UserDepartment } from "src/modules/user-department/entities/user-department.entity";
import { PendingUser } from "src/modules/user/entities/pending-user.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from "typeorm";

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

  @Column({name:'employee_count',type:'text',default:0})
  employee_count:Number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToMany(() => User, user => user.departments, {
    onDelete: 'CASCADE'
  })
  users: User[];

  @ManyToMany(() => PendingUser, pendingUser => pendingUser.departments, {
    onDelete: 'CASCADE'
  })
  pending_users: PendingUser[];

}