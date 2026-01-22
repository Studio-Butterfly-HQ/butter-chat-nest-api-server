import { PartialType } from '@nestjs/swagger';
import { CreateUserDepartmentDto } from './create-user-department.dto';

export class UpdateUserDepartmentDto extends PartialType(CreateUserDepartmentDto) {}
