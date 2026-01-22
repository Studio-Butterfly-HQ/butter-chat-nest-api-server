import { Test, TestingModule } from '@nestjs/testing';
import { UserDepartmentController } from './user-department.controller';
import { UserDepartmentService } from './user-department.service';

describe('UserDepartmentController', () => {
  let controller: UserDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDepartmentController],
      providers: [UserDepartmentService],
    }).compile();

    controller = module.get<UserDepartmentController>(UserDepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
