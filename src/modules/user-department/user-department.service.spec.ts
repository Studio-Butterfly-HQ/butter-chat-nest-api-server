import { Test, TestingModule } from '@nestjs/testing';
import { UserDepartmentService } from './user-department.service';

describe('UserDepartmentService', () => {
  let service: UserDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDepartmentService],
    }).compile();

    service = module.get<UserDepartmentService>(UserDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
