import { Test, TestingModule } from '@nestjs/testing';
import { FileHandleController } from './file-handle.controller';

describe('FileHandleController', () => {
  let controller: FileHandleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileHandleController],
      providers: [],
    }).compile();

    controller = module.get<FileHandleController>(FileHandleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
