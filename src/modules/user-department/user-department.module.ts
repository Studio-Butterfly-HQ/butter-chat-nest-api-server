import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDepartment } from './entities/user-department.entity';
import { UserDepartmentRepository } from './user-department.repository';
import { UserDepartmentService } from './user-department.service';
import { UserDepartmentController } from './user-department.controller';
import { User } from '../user/entities/user.entity';
import { Department } from '../department/entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDepartment, User, Department])],
  controllers: [UserDepartmentController],
  providers: [UserDepartmentService, UserDepartmentRepository],
  exports: [UserDepartmentService, UserDepartmentRepository]
})
export class UserDepartmentModule {}