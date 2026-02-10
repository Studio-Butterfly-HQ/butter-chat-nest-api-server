// src/modules/user/user.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Get, 
  Req, 
  Patch
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse as SwaggerApiResponse, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PendingUserDto } from './dto/pending-user.dto';
import { InvitedUserRegDto } from './dto/invited-registration.dto';
import { InvitedUserRegGuard } from './guards/invited-user-reg.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-pass-dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Invite user to company',
    description: 'Sends an invitation email to a user to join the company with specified role, departments, and shifts'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Invitation sent successfully',
    schema: {
      example: {
        success: true,
        message: 'invitation sent',
        data: 'john.doe@example.com',
        timestamp: '2026-02-05T10:30:00.000Z'
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
            email: ['email must be a valid email address'],
            role: ['role must be a valid enum value'],
            department_ids: ['each value in department_ids must be a UUID'],
            shift_ids: ['shift_ids should not be empty']
          }
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/invite'
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Conflict - User already exists or invitation already sent',
    schema: {
      example: {
        success: false,
        message: 'Email already registered as a user',
        error: {
          code: 'CONFLICT',
          details: 'This email is already associated with an active user account'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/invite'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Not Found - Department or shift not found',
    schema: {
      example: {
        success: false,
        message: 'One or more departments not found',
        error: {
          code: 'NOT_FOUND',
          details: 'The specified department or shift IDs do not exist for this company'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/invite'
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
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/invite'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to send invitation',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred while processing the invitation'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/invite'
      }
    }
  })
  async InviteUser(@Req() req, @Body() inviteUser: PendingUserDto) {
    const res = await this.userService.InviteUser(inviteUser, req.companyId);
    return ResponseUtil.success("invitation sent", res);
  }

  @Post('registration')
  @UseGuards(InvitedUserRegGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register invited user',
    description: 'Completes user registration using an invitation token. Creates a new user account with the information from the invitation.'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message: 'registration successful',
        data: {
          id: '874d9777-3361-44ac-95ea-607e032e54bf',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          user_name: 'John Doe',
          email: 'john.doe@example.com',
          profile_uri: 'https://example.com/profiles/avatar.jpg',
          bio: 'Software Engineer',
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          createdDate: '2026-02-05T10:30:00.000Z',
          updatedDate: '2026-02-05T10:30:00.000Z',
          departments: [
            {
              id: 'dept-uuid-1',
              department_name: 'Engineering'
            }
          ],
          shifts: [
            {
              id: 'shift-uuid-1',
              shift_name: 'Morning Shift'
            }
          ],
          company: {
            id: '76b8acd6-7796-445d-84be-d83c12a22318',
            company_name: 'codecaffee'
          }
        },
        timestamp: '2026-02-05T10:30:00.000Z'
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
            user_name: ['user_name should not be empty'],
            password: ['password must be at least 8 characters long']
          }
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/registration'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Not Found - Invitation not found or already used',
    schema: {
      example: {
        success: false,
        message: 'Invitation not found or already used',
        error: {
          code: 'NOT_FOUND',
          details: 'The invitation token is invalid or has already been used'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/registration'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized - Invalid or expired invitation token',
    schema: {
      example: {
        success: false,
        message: 'Invalid invitation token',
        error: {
          code: 'UNAUTHORIZED',
          details: 'The invitation token has expired or is invalid'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/registration'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to register user',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred during registration'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/registration'
      }
    }
  })
  async registerInvitedUser(@Req() req, @Body() invitedUserRegDto: InvitedUserRegDto) {
    const res = await this.userService.registerInvitedUser(invitedUserRegDto, req.user.userId);
    return ResponseUtil.success("registration successful", res);
  }

  //user list with dept
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get user list with departments',
    description: 'Retrieves a list of all users in the company with their associated department information'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User list retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'users retrieved successfully',
        data: [
          {
            id: '874d9777-3361-44ac-95ea-607e032e54bf',
            user_name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://example.com/avatars/john.jpg',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
            departments: [
              {
                id: 'dept-uuid-1',
                department_name: 'Engineering'
              },
              {
                id: 'dept-uuid-2',
                department_name: 'Product'
              }
            ]
          },
          {
            id: '987fcdeb-51a2-43f7-b890-123456789abc',
            user_name: 'Jane Smith',
            email: 'jane.smith@example.com',
            avatar: null,
            role: 'ADMIN',
            status: 'ACTIVE',
            departments: [
              {
                id: 'dept-uuid-3',
                department_name: 'Marketing'
              }
            ]
          }
        ],
        timestamp: '2026-02-05T10:30:00.000Z'
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
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve users',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users'
      }
    }
  })
  async userListWithDepartment(@Req() req) {
    const users = await this.userService.getUserListWithDepartments(req.companyId);
    return ResponseUtil.success('users retrieved successfully', users);
  }

  @Get('/socket/essential')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get socket connection essentials',
    description: 'Retrieves essential user information needed for WebSocket connections including user ID, company ID, and departments'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Socket essentials retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'retrieved successful',
        data: {
          userId: '874d9777-3361-44ac-95ea-607e032e54bf',
          companyId: '76b8acd6-7796-445d-84be-d83c12a22318',
          departments: [
            {
              department_id: 'dept-uuid-1',
              department_name: 'Engineering'
            },
            {
              department_id: 'dept-uuid-2',
              department_name: 'Marketing'
            }
          ]
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/socket/essential'
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
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/socket/essential'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve socket essentials',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/socket/essential'
      }
    }
  })
  async getSocketEssentials(@Req() req) {
    const userId = req.user.userId;
    const companyId = req.user.companyId;
    const res = await this.userService.getSocketEssentials(userId, companyId);
    const socketEssential = { userId, companyId, departments: res };
    return ResponseUtil.success("retrieved successful", socketEssential, "/socket/essential");
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get user profile',
    description: ''
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    schema: {
      example: {
        success: true,
        message: 'retrieved successful',
        data: {
          userId: '874d9777-3361-44ac-95ea-607e032e54bf',
          companyId: '76b8acd6-7796-445d-84be-d83c12a22318',
          departments: [
            {
              department_id: 'dept-uuid-1',
              department_name: 'Engineering'
            },
            {
              department_id: 'dept-uuid-2',
              department_name: 'Marketing'
            }
          ]
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/socket/essential'
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
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/socket/essential'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve socket essentials',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-02-05T10:30:00.000Z',
        path: '/users/socket/essential'
      }
    }
  })
  //user by id
  async getUserInfoById(@Req() req) {
    const userId = req.user.userId;
    const companyId = req.user.companyId;
    const res = await this.userService.getUserInfoById(userId, companyId);
    return ResponseUtil.success("retrieved successful", res, "user/profile");
  }

  //update profile data
  @Patch('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update logged-in user profile (excluding password)',
  })
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    const companyId = req.user.companyId;

    const result = await this.userService.updateUserById(
      userId,
      companyId,
      updateUserDto,
    );

    return ResponseUtil.success(
      'profile updated successfully',
      result,
      'users/profile',
    );
  }

  /**
   * PATCH /users/profile/password
   * Update logged-in user password
   */
  @Patch('/profile/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user password',
    description: 'Update logged-in user password',
  })
  async updatePassword(
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user.userId;
    const companyId = req.user.companyId;

    const result = await this.userService.updatePasswordById(
      userId,
      companyId,
      updatePasswordDto,
    );
     return ResponseUtil.success(
      'password updated successfully',
      result,
      'users/profile/password',
    );
  }

}