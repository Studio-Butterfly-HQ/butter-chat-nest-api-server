// src/modules/user/user.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) 
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new user and assign to department',
    description: 'Creates a new user account and assigns them to a specified department within the company. This is a transactional operation.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created and assigned to department successfully',
    schema: {
      example: {
        success: true,
        message: 'User created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          company_id: '123e4567-e89b-12d3-a456-426614174001',
          user_name: 'John Doe',
          email: 'john.doe@company.com',
          profile_uri: 'https://example.com/profiles/avatar.jpg',
          bio: 'Senior Software Engineer',
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          created_at: '2026-01-12T00:00:00.000Z',
          updated_at: '2026-01-12T00:00:00.000Z',
          department_assignment: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            department_id: '123e4567-e89b-12d3-a456-426614174003',
            shift_start: '09:00:00',
            shift_end: '17:00:00',
            assigned_at: '2026-01-12T00:00:00.000Z'
          }
        },
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error or shift time validation failed',
    schema: {
      example: {
        success: false,
        message: 'shift_end must be after shift_start',
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Department not found',
    schema: {
      example: {
        success: false,
        message: 'Department not found',
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - email already exists or user already assigned to department',
    schema: {
      example: {
        success: false,
        message: 'Email already exists',
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req
  ) {
    const company_id =  req.companyId
    
    const result = await this.userService.create(createUserDto, company_id);
    return ResponseUtil.created('User created successfully', result);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset user password',
    description: 'Allows users to reset their password using the token received via email. Token is valid for 24 hours.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully',
        data: {
          message: 'Password reset successfully'
        },
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid or expired token',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired reset token',
        timestamp: '2026-01-12T00:00:00.000Z'
      }
    }
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.userService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.new_password
    );
    return ResponseUtil.success('Password reset successfully', result);
  }
}