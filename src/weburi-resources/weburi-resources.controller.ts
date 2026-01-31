import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiQuery,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { WeburiResourcesService } from './weburi-resources.service';
import { CreateWeburiResourceDto } from './dto/create-weburi-resource.dto';
import { UpdateWeburiResourceDto } from './dto/update-weburi-resource.dto';
import { WeburiResourceStatus } from './entities/weburi-resource.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('WebURI Resources')
@Controller('weburi-resources')
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
        details: 'Invalid or expired token',
      },
      timestamp: '2026-01-31T10:30:00.000Z',
      path: '/weburi-resources',
    },
  },
})
export class WeburiResourcesController {
  constructor(private readonly weburiResourcesService: WeburiResourcesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new WebURI resource',
    description: 'Creates a new web URI resource for the authenticated company',
  })
  @SwaggerApiResponse({
    status: HttpStatus.CREATED,
    description: 'WebURI resource created successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource created successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/resource',
          status: 'QUEUED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T10:30:00.000Z',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
      },
    },
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
            uri: ['URI must be a valid URL'],
          },
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Conflict - URI already exists for this company',
    schema: {
      example: {
        success: false,
        message: 'URI already exists for this company',
        error: {
          code: 'CONFLICT',
          details: 'The provided URI is already registered for this company',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to create WebURI resource',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources',
      },
    },
  })
  async create(@Req() req, @Body() createWeburiResourceDto: CreateWeburiResourceDto) {
    const resource = await this.weburiResourcesService.create(
      req.companyId,
      createWeburiResourceDto,
    );
    return ResponseUtil.created('WebURI resource created successfully', resource);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all WebURI resources',
    description: 'Retrieves all web URI resources for the authenticated company',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (SYNCED, QUEUED, FAILED)',
    enum: WeburiResourceStatus,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resources retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resources retrieved successfully',
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            uri: 'https://example.com/resource1',
            status: 'SYNCED',
            createdDate: '2026-01-31T10:30:00.000Z',
            updatedDate: '2026-01-31T10:30:00.000Z',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            uri: 'https://example.com/resource2',
            status: 'QUEUED',
            createdDate: '2026-01-31T09:30:00.000Z',
            updatedDate: '2026-01-31T09:30:00.000Z',
          },
        ],
        timestamp: '2026-01-31T10:30:00.000Z',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve WebURI resources',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources',
      },
    },
  })
  async findAll(@Req() req, @Query('status') status?: WeburiResourceStatus) {
    let resources;

    if (status && Object.values(WeburiResourceStatus).includes(status)) {
      resources = await this.weburiResourcesService.findByCompanyAndStatus(req.companyId, status);
    } else {
      resources = await this.weburiResourcesService.findAllByCompany(req.companyId);
    }

    return ResponseUtil.success('WebURI resources retrieved successfully', resources);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a WebURI resource by ID',
    description: 'Retrieves a specific web URI resource by ID for the authenticated company',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resource retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource retrieved successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/resource',
          status: 'SYNCED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T10:30:00.000Z',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve WebURI resource',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  async findOne(@Req() req, @Param('id') id: string) {
    const resource = await this.weburiResourcesService.findOne(id, req.companyId);
    return ResponseUtil.success('WebURI resource retrieved successfully', resource);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a WebURI resource',
    description: 'Updates a specific web URI resource for the authenticated company',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resource updated successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/updated-resource',
          status: 'SYNCED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T11:30:00.000Z',
        },
        timestamp: '2026-01-31T11:30:00.000Z',
      },
    },
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
            uri: ['URI must be a valid URL'],
          },
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Conflict - URI already exists for this company',
    schema: {
      example: {
        success: false,
        message: 'URI already exists for this company',
        error: {
          code: 'CONFLICT',
          details: 'The provided URI is already registered for this company',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to update WebURI resource',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateWeburiResourceDto: UpdateWeburiResourceDto,
  ) {
    const resource = await this.weburiResourcesService.update(
      id,
      req.companyId,
      updateWeburiResourceDto,
    );
    return ResponseUtil.success('WebURI resource updated successfully', resource);
  }

  @Patch(':id/status/synced')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark a WebURI resource as synced',
    description: 'Updates the status of a web URI resource to SYNCED',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resource marked as synced successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource marked as synced',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/resource',
          status: 'SYNCED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T11:30:00.000Z',
        },
        timestamp: '2026-01-31T11:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/synced',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to mark WebURI resource as synced',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/synced',
      },
    },
  })
  async markAsSynced(@Req() req, @Param('id') id: string) {
    const resource = await this.weburiResourcesService.markAsSynced(id, req.companyId);
    return ResponseUtil.success('WebURI resource marked as synced', resource);
  }

  @Patch(':id/status/queued')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark a WebURI resource as queued',
    description: 'Updates the status of a web URI resource to QUEUED',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resource marked as queued successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource marked as queued',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/resource',
          status: 'QUEUED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T11:30:00.000Z',
        },
        timestamp: '2026-01-31T11:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/queued',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to mark WebURI resource as queued',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/queued',
      },
    },
  })
  async markAsQueued(@Req() req, @Param('id') id: string) {
    const resource = await this.weburiResourcesService.markAsQueued(id, req.companyId);
    return ResponseUtil.success('WebURI resource marked as queued', resource);
  }

  @Patch(':id/status/failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark a WebURI resource as failed',
    description: 'Updates the status of a web URI resource to FAILED',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'WebURI resource marked as failed successfully',
    schema: {
      example: {
        success: true,
        message: 'WebURI resource marked as failed',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          uri: 'https://example.com/resource',
          status: 'FAILED',
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T11:30:00.000Z',
        },
        timestamp: '2026-01-31T11:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/failed',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to mark WebURI resource as failed',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000/status/failed',
      },
    },
  })
  async markAsFailed(@Req() req, @Param('id') id: string) {
    const resource = await this.weburiResourcesService.markAsFailed(id, req.companyId);
    return ResponseUtil.success('WebURI resource marked as failed', resource);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a WebURI resource',
    description: 'Permanently deletes a specific web URI resource for the authenticated company',
  })
  @ApiParam({
    name: 'id',
    description: 'WebURI resource ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'WebURI resource deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'WebURI resource not found',
    schema: {
      example: {
        success: false,
        message: 'WebURI Resource with ID 550e8400-e29b-41d4-a716-446655440000 not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The requested WebURI resource does not exist',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete WebURI resource',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/weburi-resources/550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  async remove(@Req() req, @Param('id') id: string) {
    await this.weburiResourcesService.remove(id, req.companyId);
    return ResponseUtil.noContent('WebURI resource deleted successfully');
  }
}