// src/modules/company/company.controller.ts
import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Body, 
  Req, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse, 
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('Company')
@Controller('company')
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
      path: '/company'
    }
  }
})
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get company profile',
    description: 'Retrieves the authenticated company profile with associated user information'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Company profile retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'company profile data',
        data: {
          createdDate: '2026-01-22T06:48:12.284Z',
          updatedDate: '2026-01-24T03:32:42.000Z',
          id: '76b8acd6-7796-445d-84be-d83c12a22318',
          company_name: 'codecaffee',
          subdomain: 'code.butterchat.io',
          logo: 'https://example.com/logo.png',
          banner: 'https://example.com/banner.png',
          bio: 'We are a leading provider of innovative solutions',
          company_category: 'Technology',
          country: 'United States',
          language: 'english',
          timezone: 'utc',
          status: 'PENDING',
          users: [
            {
              id: '874d9777-3361-44ac-95ea-607e032e54bf',
              user_name: 'codecaffee_Admin',
              email: 'codecaffee@gmail.com',
              profile_uri: null,
              role: 'OWNER'
            }
          ]
        },
        timestamp: '2026-01-26T11:08:26.975Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Company not found',
    schema: {
      example: {
        success: false,
        message: 'Company not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Company profile does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/profile'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve company profile',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/profile'
      }
    }
  })
  async getCompanyProfile(@Req() req) {
    console.log("userId: ", req.userId);
    console.log("companyId: ", req.companyId);
    const profile = await this.companyService.getCompanyByIdWithUser(req.companyId, req.userId);
    return ResponseUtil.success(
      'company profile data',
      profile
    );
  }

  @Patch('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update company profile',
    description: 'Updates the authenticated company profile information'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'updated successfully',
        data: {
          createdDate: '2026-01-22T06:48:12.284Z',
          updatedDate: '2026-01-26T12:00:00.000Z',
          id: '76b8acd6-7796-445d-84be-d83c12a22318',
          company_name: 'codecaffee updated',
          subdomain: 'code.butterchat.io',
          logo: 'https://example.com/logo-new.png',
          banner: 'https://example.com/banner-new.png',
          bio: 'We are a leading provider of innovative solutions - Updated',
          company_category: 'Technology',
          country: 'United States',
          language: 'english',
          timezone: 'utc',
          status: 'ACTIVE'
        },
        timestamp: '2026-01-26T12:00:00.000Z'
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
            company_name: ['company_name should not be empty'],
            subdomain: ['subdomain must be a valid format']
          }
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/update'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Company not found',
    schema: {
      example: {
        success: false,
        message: 'Company not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Company profile does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/update'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to update company profile',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/update'
      }
    }
  })
  async updateCompanyProfile(@Req() req, @Body() updateCompanyDto: UpdateCompanyDto) {
    const result = await this.companyService.updateCompany(req.companyId, updateCompanyDto);
    return ResponseUtil.created(
      'updated successfully',
      result
    );
  }

  @Delete('delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete company profile',
    description: 'Permanently deletes the authenticated company profile and associated data'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Profile deleted successfully'
  })
  @ApiNotFoundResponse({ 
    description: 'Company not found',
    schema: {
      example: {
        success: false,
        message: 'Company not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Company profile does not exist'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/delete'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete company profile',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2024-01-26T10:30:00.000Z',
        path: '/company/delete'
      }
    }
  })
  async deleteCompanyProfile(@Req() req) {
    const result = await this.companyService.deleteCompany(req.companyId);
    return ResponseUtil.noContent('profile deleted');
  }
}