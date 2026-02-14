import { 
  Controller, 
  Get, 
  Post,
  Patch, 
  Delete, 
  Body, 
  Req, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse, 
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { ResponseUtil } from 'src/common/utils/response.util';

/**
 * Customer Controller
 * Handles all customer-related HTTP requests
 */
@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * Register a new customer
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new customer',
    description: 'Creates a new customer account with the provided information. Returns JWT token for authentication.'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Customer registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer registered successfully',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          customer: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            name: 'John Doe',
            profile_uri: 'https://example.com/profile.jpg',
            contact: 'john.doe@example.com',
            source: 'WEB',
            conversation_count: 0,
            createdDate: '2026-02-14T10:30:00.000Z',
            updatedDate: '2026-02-14T10:30:00.000Z'
          }
        },
        timestamp: '2026-02-14T10:30:00.000Z'
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
            password: ['password must be at least 8 characters']
          }
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/register'
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Conflict - Customer already exists',
    schema: {
      example: {
        success: false,
        message: 'Customer already exists with this contact and source for the company',
        error: {
          code: 'CONFLICT',
          details: 'Customer already registered'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/register'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to register customer',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/register'
      }
    }
  })
  async register(@Body() registerDto: RegisterCustomerDto) {
    const result = await this.customerService.register(registerDto);
    return ResponseUtil.created('Customer registered successfully', result);
  }

  /**
   * Customer login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Customer login',
    description: 'Authenticates a customer and returns JWT token for subsequent requests'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          customer: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
            name: 'John Doe',
            profile_uri: 'https://example.com/profile.jpg',
            contact: 'john.doe@example.com',
            source: 'WEB',
            conversation_count: 5,
            createdDate: '2026-02-14T10:30:00.000Z',
            updatedDate: '2026-02-14T12:00:00.000Z'
          }
        },
        timestamp: '2026-02-14T12:00:00.000Z'
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
            contact: ['contact should not be empty'],
            password: ['password should not be empty']
          }
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/login'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'UNAUTHORIZED',
          details: 'Contact, password, or source is incorrect'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/login'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to login',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/login'
      }
    }
  })
  async login(@Body() loginDto: LoginCustomerDto) {
    const result = await this.customerService.login(loginDto);
    return ResponseUtil.success('Login successful', result);
  }

  /**
   * Get customer profile (protected route)
   */
  @Get('profile')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('customer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get customer profile',
    description: 'Retrieves the authenticated customer profile information'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Customer profile retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer profile data',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          name: 'John Doe',
          profile_uri: 'https://example.com/profile.jpg',
          contact: 'john.doe@example.com',
          source: 'WEB',
          conversation_count: 5,
          createdDate: '2026-02-14T10:30:00.000Z',
          updatedDate: '2026-02-14T12:00:00.000Z'
        },
        timestamp: '2026-02-14T12:00:00.000Z'
      }
    }
  })
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
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/profile'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Customer not found',
    schema: {
      example: {
        success: false,
        message: 'Customer not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Customer profile does not exist'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/profile'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve customer profile',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/profile'
      }
    }
  })
  async getProfile(@Req() req) {
    console.log('customerId:', req.customerId);
    console.log('companyId:', req.companyId);
    
    const profile = await this.customerService.getCustomerById(
      req.customerId, 
      req.companyId
    );
    
    return ResponseUtil.success('Customer profile data', profile);
  }

  /**
   * Update customer profile (protected route)
   */
  @Patch('update')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('customer-jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update customer profile',
    description: 'Updates the authenticated customer profile information'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          name: 'John Doe Updated',
          profile_uri: 'https://example.com/new-profile.jpg',
          contact: 'john.doe@example.com',
          source: 'WEB',
          conversation_count: 5,
          createdDate: '2026-02-14T10:30:00.000Z',
          updatedDate: '2026-02-14T13:00:00.000Z'
        },
        timestamp: '2026-02-14T13:00:00.000Z'
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
            name: ['name must be at least 2 characters']
          }
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/update'
      }
    }
  })
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
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/update'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Customer not found',
    schema: {
      example: {
        success: false,
        message: 'Customer not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Customer profile does not exist'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/update'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to update customer profile',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/update'
      }
    }
  })
  async updateProfile(@Req() req, @Body() updateDto: UpdateCustomerDto) {
    const result = await this.customerService.updateCustomer(
      req.customerId,
      req.companyId,
      updateDto
    );
    
    return ResponseUtil.success('Profile updated successfully', result);
  }

  /**
   * Delete customer account (protected route)
   */
  @Delete('delete')
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth('customer-jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete customer account',
    description: 'Permanently deletes the authenticated customer account and all associated data'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Account deleted successfully'
  })
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
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/delete'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Customer not found',
    schema: {
      example: {
        success: false,
        message: 'Customer not found',
        error: {
          code: 'NOT_FOUND',
          details: 'Customer account does not exist'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/delete'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete customer account',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-14T10:30:00.000Z',
        path: '/customer/delete'
      }
    }
  })
  async deleteAccount(@Req() req) {
    await this.customerService.deleteCustomer(req.customerId, req.companyId);
    return ResponseUtil.noContent('Account deleted successfully');
  }
}