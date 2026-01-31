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
  HttpStatus
} from '@nestjs/common';
import { AiAgentsService } from './ai-agents.service';
import { CreateAiAgentDto } from './dto/create-ai-agent.dto';
import { UpdateAiAgentDto } from './dto/update-ai-agent.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiParam
} from '@nestjs/swagger';
import { ResponseUtil } from 'src/common/utils/response.util';

@ApiTags('AI Agents')
@Controller('ai-agents')
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
      timestamp: '2026-01-31T10:30:00.000Z',
      path: '/ai-agents'
    }
  }
})
export class AiAgentsController {
  constructor(private readonly aiAgentsService: AiAgentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create AI agent',
    description: 'Creates a new AI agent for the authenticated company'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'AI agent created successfully',
    schema: {
      example: {
        success: true,
        message: 'AI agent created successfully',
        data: {
          id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
          agent_name: 'Customer Support Agent',
          personality: 'Friendly and helpful customer service representative',
          general_instructions: 'Assist customers with their inquiries and provide accurate information',
          avatar: 'https://example.com/avatar.png',
          choice_when_unable: 'transfer_to_human',
          conversation_pass_instructions: 'Transfer conversation when customer requests human agent',
          auto_tranfer: 'enabled',
          transfer_connecting_message: 'Connecting you to a human agent...',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          enabled: true,
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T10:30:00.000Z'
        },
        timestamp: '2026-01-31T10:30:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid input data or duplicate agent name',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            agent_name: ['agent_name should not be empty'],
            personality: ['personality should not be empty']
          }
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to create AI agent',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents'
      }
    }
  })
  async create(@Req() req, @Body() createAiAgentDto: CreateAiAgentDto) {
    const agent = await this.aiAgentsService.create(req.companyId, createAiAgentDto);
    return ResponseUtil.created(
      'AI agent created successfully',
      agent
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all AI agents',
    description: 'Retrieves all AI agents for the authenticated company'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'AI agents retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'AI agents retrieved successfully',
        data: [
          {
            id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
            agent_name: 'Customer Support Agent',
            personality: 'Friendly and helpful customer service representative',
            general_instructions: 'Assist customers with their inquiries and provide accurate information',
            avatar: 'https://example.com/avatar.png',
            choice_when_unable: 'transfer_to_human',
            conversation_pass_instructions: 'Transfer conversation when customer requests human agent',
            auto_tranfer: 'enabled',
            transfer_connecting_message: 'Connecting you to a human agent...',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          enabled: true,
            createdDate: '2026-01-31T10:30:00.000Z',
            updatedDate: '2026-01-31T10:30:00.000Z'
          },
          {
            id: 'b2c3d4e5-6789-01bc-def2-234567890abc',
            agent_name: 'Sales Assistant',
            personality: 'Professional and persuasive sales representative',
            general_instructions: 'Help customers make informed purchasing decisions',
            avatar: 'https://example.com/sales-avatar.png',
            choice_when_unable: 'provide_alternatives',
            conversation_pass_instructions: 'Offer alternative solutions when unable to assist',
            auto_tranfer: 'disabled',
            transfer_connecting_message: '',
            company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          enabled: true,
            createdDate: '2026-01-30T08:15:00.000Z',
            updatedDate: '2026-01-30T08:15:00.000Z'
          }
        ],
        timestamp: '2026-01-31T10:30:00.000Z'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve AI agents',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents'
      }
    }
  })
  async findAll(@Req() req) {
    const agents = await this.aiAgentsService.findAllByCompany(req.companyId);
    return ResponseUtil.success(
      'AI agents retrieved successfully',
      agents
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get AI agent by ID',
    description: 'Retrieves a specific AI agent by its ID'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the AI agent',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'AI agent retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'AI agent retrieved successfully',
        data: {
          id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
          agent_name: 'Customer Support Agent',
          personality: 'Friendly and helpful customer service representative',
          general_instructions: 'Assist customers with their inquiries and provide accurate information',
          avatar: 'https://example.com/avatar.png',
          choice_when_unable: 'transfer_to_human',
          conversation_pass_instructions: 'Transfer conversation when customer requests human agent',
          auto_tranfer: 'enabled',
          transfer_connecting_message: 'Connecting you to a human agent...',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          enabled: true,
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T10:30:00.000Z'
        },
        timestamp: '2026-01-31T10:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'AI agent not found',
    schema: {
      example: {
        success: false,
        message: 'AI agent not found',
        error: {
          code: 'NOT_FOUND',
          details: 'AI agent with the specified ID does not exist'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to retrieve AI agent',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  async findOne(@Req() req, @Param('id') id: string) {
    const agent = await this.aiAgentsService.findOne(id, req.companyId);
    return ResponseUtil.success(
      'AI agent retrieved successfully',
      agent
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update AI agent',
    description: 'Updates an existing AI agent by its ID'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the AI agent',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.OK, 
    description: 'AI agent updated successfully',
    schema: {
      example: {
        success: true,
        message: 'AI agent updated successfully',
        data: {
          id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
          agent_name: 'Updated Customer Support Agent',
          personality: 'Very friendly and highly helpful customer service representative',
          general_instructions: 'Assist customers with their inquiries and provide accurate, detailed information',
          avatar: 'https://example.com/new-avatar.png',
          choice_when_unable: 'transfer_to_human',
          conversation_pass_instructions: 'Transfer conversation when customer requests human agent or issue is complex',
          auto_tranfer: 'enabled',
          transfer_connecting_message: 'Connecting you to our specialist team...',
          company_id: '76b8acd6-7796-445d-84be-d83c12a22318',
          enabled: true,
          createdDate: '2026-01-31T10:30:00.000Z',
          updatedDate: '2026-01-31T12:45:00.000Z'
        },
        timestamp: '2026-01-31T12:45:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Bad Request - Invalid input data or duplicate agent name',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: {
            agent_name: ['An AI agent with this name already exists']
          }
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'AI agent not found',
    schema: {
      example: {
        success: false,
        message: 'AI agent not found',
        error: {
          code: 'NOT_FOUND',
          details: 'AI agent with the specified ID does not exist'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to update AI agent',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  async update(
    @Req() req,
    @Param('id') id: string, 
    @Body() updateAiAgentDto: UpdateAiAgentDto
  ) {
    const agent = await this.aiAgentsService.update(id, req.companyId, updateAiAgentDto);
    return ResponseUtil.success(
      'AI agent updated successfully',
      agent
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete AI agent',
    description: 'Permanently deletes an AI agent by its ID'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The unique identifier of the AI agent',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab'
  })
  @SwaggerApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'AI agent deleted successfully'
  })
  @ApiNotFoundResponse({ 
    description: 'AI agent not found',
    schema: {
      example: {
        success: false,
        message: 'AI agent not found',
        error: {
          code: 'NOT_FOUND',
          details: 'AI agent with the specified ID does not exist'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Failed to delete AI agent',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: 'An unexpected error occurred'
        },
        timestamp: '2026-01-31T10:30:00.000Z',
        path: '/ai-agents/a1b2c3d4-5678-90ab-cdef-1234567890ab'
      }
    }
  })
  async remove(@Req() req, @Param('id') id: string) {
    await this.aiAgentsService.remove(id, req.companyId);
    return ResponseUtil.noContent('AI agent deleted successfully');
  }
}