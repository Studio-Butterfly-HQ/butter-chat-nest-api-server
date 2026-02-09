// src/modules/social-connection/social-connection.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
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
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';
import { SocialConnectionService } from './social-connection.service';
import { CreateSocialConnectionDto } from './dto/create-social-connection.dto';

@ApiTags('Social Connections')
@Controller('social-connections')
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
      timestamp: '2026-02-10T10:30:00.000Z',
      path: '/social-connections',
    },
  },
})
export class SocialConnectionController {
  constructor(
    private readonly socialConnectionService: SocialConnectionService,
  ) {}

  /**
   * Create a new social connection
   */
//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   @ApiOperation({
//     summary: 'Create a new social media connection',
//     description: `
//       Creates a new social media platform connection for your company.
//       - Each company can have only one connection per platform type
//       - Tokens are securely stored and masked in responses
//       - Supported platforms: Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok, WhatsApp, Telegram
//     `,
//   })
//   @SwaggerApiResponse({
//     status: HttpStatus.CREATED,
//     description: 'Social connection created successfully',
//     type: SocialConnectionCreateResponseDto,
//     schema: {
//       example: {
//         success: true,
//         message: 'Social connection created successfully',
//         data: {
//           id: '123e4567-e89b-12d3-a456-426614174000',
//           company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
//           platform_name: 'Facebook Business',
//           platform_type: 'facebook',
//           platform_token: 'EAABwzLi****',
//           createdDate: '2026-02-10T10:30:00.000Z',
//           updatedDate: '2026-02-10T10:30:00.000Z',
//         },
//         timestamp: '2026-02-10T10:30:00.000Z',
//       },
//     },
//   })
//   @ApiBadRequestResponse({
//     description: 'Invalid input data',
//     schema: {
//       example: {
//         success: false,
//         message: 'Validation failed',
//         error: {
//           code: 'BAD_REQUEST',
//           details: 'platform_type must be one of the allowed values',
//         },
//         timestamp: '2026-02-10T10:30:00.000Z',
//         path: '/social-connections',
//       },
//     },
//   })
//   @ApiConflictResponse({
//     description: 'Connection already exists for this platform',
//     schema: {
//       example: {
//         success: false,
//         message:
//           'A facebook connection already exists for this company. Please delete the existing one first.',
//         error: {
//           code: 'CONFLICT',
//           details: 'Duplicate platform connection',
//         },
//         timestamp: '2026-02-10T10:30:00.000Z',
//         path: '/social-connections',
//       },
//     },
//   })
//   @ApiInternalServerErrorResponse({
//     description: 'Internal server error',
//     schema: {
//       example: {
//         success: false,
//         message: 'Failed to create social connection',
//         error: {
//           code: 'INTERNAL_SERVER_ERROR',
//           details: 'An unexpected error occurred',
//         },
//         timestamp: '2026-02-10T10:30:00.000Z',
//         path: '/social-connections',
//       },
//     },
//   })
//   async create(@Req() req, @Body() createDto: CreateSocialConnectionDto) {
//     const companyId = req.companyId;
//     const connection = await this.socialConnectionService.create(
//       createDto,
//       companyId,
//     );

//     return ResponseUtil.created(
//       'Social connection created successfully',
//       connection,
//     );
//   }

  /**
   * Get all social connections for the company
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all social media connections',
    description: `
      Retrieves all social media connections for your company.
      - Returns connections sorted by creation date (newest first)
      - Access tokens are masked for security (only first 8 characters shown)
      - Company-isolated: only your company's connections are returned
    `,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Social connections retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Social connections retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            platform_name: 'Facebook Business',
            platform_type: 'facebook',
            platform_token: 'EAABwzLi****',
            createdDate: '2026-02-10T10:30:00.000Z',
            updatedDate: '2026-02-10T10:30:00.000Z',
          },
          {
            id: '234e5678-e89b-12d3-a456-426614174001',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            platform_name: 'Instagram Business',
            platform_type: 'instagram',
            platform_token: 'IGQVJXaz****',
            createdDate: '2026-02-09T15:20:00.000Z',
            updatedDate: '2026-02-09T15:20:00.000Z',
          },
        ],
        timestamp: '2026-02-10T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No connections found (returns empty array)',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve social connections',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections',
      },
    },
  })
  async findAll(@Req() req) {
    console.log('userId:', req.userId);
    console.log('companyId:', req.companyId);

    const companyId = req.companyId;
    const connections = await this.socialConnectionService.findAllByCompany(
      companyId,
    );

    return ResponseUtil.success(
      'Social connections retrieved successfully',
      connections,
    );
  }

  /**
   * Get a specific social connection by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific social media connection',
    description: `
      Retrieves a specific social media connection by ID.
      - Access token is masked for security
      - Only accessible if connection belongs to your company
      - Returns 404 if not found or belongs to another company
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Social connection UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Social connection retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Social connection retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          platform_name: 'Facebook Business',
          platform_type: 'facebook',
          platform_token: 'EAABwzLi****',
          createdDate: '2026-02-10T10:30:00.000Z',
          updatedDate: '2026-02-10T10:30:00.000Z',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Social connection not found or access denied',
    schema: {
      example: {
        success: false,
        message:
          'Social connection with ID 123e4567-e89b-12d3-a456-426614174000 not found or access denied',
        error: {
          code: 'NOT_FOUND',
          details: 'Connection does not exist or belongs to another company',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections/123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid connection ID format',
    schema: {
      example: {
        success: false,
        message: 'Connection ID is required',
        error: {
          code: 'BAD_REQUEST',
          details: 'Invalid UUID format',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections/invalid-id',
      },
    },
  })
  async findOne(@Req() req, @Param('id') id: string) {
    const companyId = req.companyId;
    const connection = await this.socialConnectionService.findOne(
      id,
      companyId,
    );

    return ResponseUtil.success(
      'Social connection retrieved successfully',
      connection,
    );
  }

  /**
   * Delete a social connection
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a social media connection',
    description: `
      Permanently deletes a social media connection.
      - Can only delete connections belonging to your company
      - Cannot be undone
      - Returns 404 if connection not found or belongs to another company
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Social connection UUID to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Social connection deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Social connection deleted successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Social connection not found or access denied',
    schema: {
      example: {
        success: false,
        message:
          'Social connection with ID 123e4567-e89b-12d3-a456-426614174000 not found or access denied',
        error: {
          code: 'NOT_FOUND',
          details: 'Connection does not exist or belongs to another company',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections/123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid connection ID',
    schema: {
      example: {
        success: false,
        message: 'Connection ID is required',
        error: {
          code: 'BAD_REQUEST',
          details: 'Invalid UUID format',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections/invalid-id',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete social connection',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
        path: '/social-connections/123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  async delete(@Req() req, @Param('id') id: string) {
    console.log('Deleting connection ID:', id, 'for company:', req.companyId);

    const companyId = req.companyId;
    const result = await this.socialConnectionService.delete(id, companyId);

    return ResponseUtil.success('Social connection deleted successfully', result);
  }

  /**
   * Get connection statistics
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get social connections statistics',
    description: `
      Retrieves statistics about your company's social media connections.
      - Total number of connections
      - Breakdown by platform type
      - Useful for dashboard/overview displays
    `,
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Connection statistics retrieved successfully',
        data: {
          total: 5,
          byPlatform: [
            { platformType: 'facebook', count: 1 },
            { platformType: 'instagram', count: 1 },
            { platformType: 'twitter', count: 1 },
            { platformType: 'linkedin', count: 1 },
            { platformType: 'youtube', count: 1 },
          ],
        },
        timestamp: '2026-02-10T10:30:00.000Z',
      },
    },
  })
  async getStats(@Req() req) {
    const companyId = req.companyId;
    const stats = await this.socialConnectionService.getStats(companyId);

    return ResponseUtil.success(
      'Connection statistics retrieved successfully',
      stats,
    );
  }

  /**
   * Verify a connection token
   */
  @Get(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a social connection token',
    description: `
      Verifies if a social media connection token is still valid.
      - Checks token validity with the platform (implementation pending)
      - Returns validation status and message
      - Only accessible for your company's connections
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Social connection UUID to verify',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @SwaggerApiResponse({
    status: HttpStatus.OK,
    description: 'Token verification result',
    schema: {
      example: {
        success: true,
        message: 'Token verification completed',
        data: {
          valid: true,
          message: 'Connection token is valid',
        },
        timestamp: '2026-02-10T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Social connection not found',
  })
  async verifyConnection(@Req() req, @Param('id') id: string) {
    const companyId = req.companyId;
    const result = await this.socialConnectionService.verifyConnection(
      id,
      companyId,
    );

    return ResponseUtil.success('Token verification completed', result);
  }
}