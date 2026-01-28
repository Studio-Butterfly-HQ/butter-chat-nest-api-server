import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('department')
@Controller('department')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all departments for the company',
    description:
      "Retrieves a list of all departments for the authenticated user's company. Each department includes up to 10 users (id, name and email only) and the total employee count.",
  })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'department list' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
              company_id: { type: 'string', format: 'uuid' },
              department_name: { type: 'string', example: 'Engineering' },
              description: { type: 'string', nullable: true, example: 'Software development team' },
              department_profile_uri: { type: 'string', nullable: true },
              employee_count: { type: 'number', example: 25 },
              createdDate: { type: 'string', format: 'date-time' },
              updatedDate: { type: 'string', format: 'date-time' },
              users: {
                type: 'array',
                maxItems: 10,
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    user_name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                  },
                },
              },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'UNAUTHORIZED' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async findAll(@Req() req) {
    const res = await this.departmentService.findAll(req.companyId);
    return ResponseUtil.success('department list', res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get department by ID',
    description:
      'Retrieves detailed information about a specific department including employee count and up to 10 users (id, name and email only).',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Department UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Department retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            company_id: { type: 'string', format: 'uuid' },
            department_name: { type: 'string', example: 'Engineering' },
            description: { type: 'string', nullable: true, example: 'Software development team' },
            department_profile_uri: { type: 'string', nullable: true },
            employee_count: { type: 'number', example: 25 },
            createdDate: { type: 'string', format: 'date-time' },
            updatedDate: { type: 'string', format: 'date-time' },
            users: {
              type: 'array',
              maxItems: 10,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  user_name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                },
              },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Department not found' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'UNAUTHORIZED' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const department = await this.departmentService.findOne(id, req.companyId);
    return ResponseUtil.success('Department retrieved successfully', department);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new department',
    description:
      "Creates a new department for the authenticated user's company. The department will have employee_count set to 0 initially.",
  })
  @ApiBody({
    type: CreateDepartmentDto,
    description: 'Department creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Department created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            company_id: { type: 'string', format: 'uuid' },
            department_name: { type: 'string', example: 'Engineering' },
            description: { type: 'string', nullable: true, example: 'Software development team' },
            department_profile_uri: { type: 'string', nullable: true },
            employee_count: { type: 'number', example: 0 },
            createdDate: { type: 'string', format: 'date-time' },
            updatedDate: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Validation failed' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: {
              type: 'object',
              example: { department_name: ['department_name should not be empty'] },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Department with this name already exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: "Department with name 'Engineering' already exists in this company" },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'CONFLICT' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'UNAUTHORIZED' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async create(
    @CurrentUser('companyId') companyId: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    const department = await this.departmentService.create(
      companyId,
      createDepartmentDto,
    );
    return ResponseUtil.created('Department created successfully', department);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update department',
    description:
      'Updates an existing department. Only provided fields will be updated. Returns updated department with up to 10 users.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Department UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateDepartmentDto,
    description: 'Department update data (all fields are optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Department updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            company_id: { type: 'string', format: 'uuid' },
            department_name: { type: 'string', example: 'Engineering' },
            description: { type: 'string', nullable: true, example: 'Updated description' },
            department_profile_uri: { type: 'string', nullable: true },
            employee_count: { type: 'number', example: 25 },
            createdDate: { type: 'string', format: 'date-time' },
            updatedDate: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Department with ID 550e8400-e29b-41d4-a716-446655440000 not found' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Department with this name already exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: "Department with name 'Engineering' already exists in this company" },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'CONFLICT' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Validation failed' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { type: 'object' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'UNAUTHORIZED' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() req,
  ) {
    const department = await this.departmentService.update(
      id,
      updateDepartmentDto,
      req.companyId,
    );
    return ResponseUtil.success('Department updated successfully', department);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete department',
    description:
      'Deletes a department. This will also remove all user-department associations from the junction table due to CASCADE delete.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Department UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Department deleted successfully' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Department deleted successfully' },
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Department with ID 550e8400-e29b-41d4-a716-446655440000 not found' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOT_FOUND' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time', example: '2026-01-26T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'UNAUTHORIZED' },
            details: { type: 'null' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const result = await this.departmentService.remove(id, req.companyId);
    return ResponseUtil.success('Department deleted successfully', result);
  }
}