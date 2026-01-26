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
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/interface/api-response.interface';

@ApiTags('Shifts')
@Controller('shift')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiUnauthorizedResponse({ 
  description: 'Unauthorized - Invalid or missing JWT token',
  schema: {
    example: {
      success: false,
      message: 'Unauthorized access',
      error: {
        code: 'UNAUTHORIZED',
        details: 'Invalid or expired token'
      },
      timestamp: '2024-01-26T10:30:00.000Z',
      path: '/shift'
    }
  }
})
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new shift',
    description: 'Creates a new shift for the authenticated company'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.CREATED,
    description: 'Shift created successfully',
    schema: {
      example: {
        success: true,
        message: 'Shift created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Morning Shift',
          startTime: '09:00',
          endTime: '17:00',
          companyId: 'comp-123',
          createdAt: '2024-01-26T10:30:00.000Z',
          updatedAt: '2024-01-26T10:30:00.000Z'
        },
        timestamp: '2024-01-26T10:30:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            name: ['name should not be empty'],
            startTime: ['startTime must be a valid time format']
          }
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to create shift',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift'
      }
    }
  })
  async create(@Req() req, @Body() createShiftDto: CreateShiftDto): Promise<ApiResponse> {
    const companyId = req.companyId;
    const shift = await this.shiftService.create(companyId, createShiftDto);
    
    return {
      success: true,
      message: 'Shift created successfully',
      data: shift,
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all shifts',
    description: 'Retrieves all shifts for the authenticated company'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK,
    description: 'Shifts retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Shifts retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Morning Shift',
            startTime: '09:00',
            endTime: '17:00',
            companyId: 'comp-123',
            createdAt: '2024-01-26T10:30:00.000Z',
            updatedAt: '2024-01-26T10:30:00.000Z'
          }
        ],
        timestamp: '2024-01-26T10:30:00.000Z'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve shifts',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift'
      }
    }
  })
  async findAll(@Req() req): Promise<ApiResponse> {
    const companyId = req.companyId;
    const shifts = await this.shiftService.findAll(companyId);
    
    return {
      success: true,
      message: 'Shifts retrieved successfully',
      data: shifts,
      timestamp: new Date().toISOString()
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get shift by ID',
    description: 'Retrieves a specific shift by its ID for the authenticated company'
  })
  @ApiParam({
    name: 'id',
    description: 'Shift ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK,
    description: 'Shift retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Shift retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Morning Shift',
          startTime: '09:00',
          endTime: '17:00',
          companyId: 'comp-123',
          createdAt: '2024-01-26T10:30:00.000Z',
          updatedAt: '2024-01-26T10:30:00.000Z'
        },
        timestamp: '2024-01-26T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Shift not found',
    schema: {
      example: {
        success: false,
        message: 'Shift not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Shift with the specified ID does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve shift',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  async findOne(@Req() req, @Param('id') id: string): Promise<ApiResponse> {
    const companyId = req.companyId;
    const shift = await this.shiftService.findOne(companyId, id);
    
    return {
      success: true,
      message: 'Shift retrieved successfully',
      data: shift,
      timestamp: new Date().toISOString()
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update shift',
    description: 'Updates an existing shift for the authenticated company'
  })
  @ApiParam({
    name: 'id',
    description: 'Shift ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK,
    description: 'Shift updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Shift updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Morning Shift (Updated)',
          startTime: '08:00',
          endTime: '16:00',
          companyId: 'comp-123',
          createdAt: '2024-01-26T10:30:00.000Z',
          updatedAt: '2024-01-26T11:45:00.000Z'
        },
        timestamp: '2024-01-26T11:45:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            startTime: ['startTime must be a valid time format']
          }
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Shift not found',
    schema: {
      example: {
        success: false,
        message: 'Shift not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Shift with the specified ID does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to update shift',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  async update(@Req() req, @Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto): Promise<ApiResponse> {
    const companyId = req.companyId;
    const shift = await this.shiftService.update(companyId, id, updateShiftDto);
    
    return {
      success: true,
      message: 'Shift updated successfully',
      data: shift,
      timestamp: new Date().toISOString()
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete shift',
    description: 'Deletes a shift for the authenticated company'
  })
  @ApiParam({
    name: 'id',
    description: 'Shift ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK,
    description: 'Shift deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Shift deleted successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          deleted: true
        },
        timestamp: '2024-01-26T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Shift not found',
    schema: {
      example: {
        success: false,
        message: 'Shift not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Shift with the specified ID does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete shift',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/shift/123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  async remove(@Req() req, @Param('id') id: string): Promise<ApiResponse> {
    const companyId = req.companyId;
    const result = await this.shiftService.remove(companyId, id);
    
    return {
      success: true,
      message: 'Shift deleted successfully',
      data: result,
      timestamp: new Date().toISOString()
    };
  }
}