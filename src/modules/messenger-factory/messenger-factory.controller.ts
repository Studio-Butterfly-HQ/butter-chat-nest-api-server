import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  HttpCode, 
  HttpStatus, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MessengerFactoryService } from './messenger-factory.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ResponseUtil } from '../../common/utils/response.util';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('messenger-factory')
@Controller('messenger-factory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessengerFactoryController {
  constructor(private readonly messengerFactoryService: MessengerFactoryService) {}


  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new conversation',
    description: 'Creates a new conversation for a customer within the company'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Conversation created successfully',
    schema: {
      example: {
        success: true,
        message: 'Conversation created successfully',
        data: {
          conversation_id: '123e4567-e89b-12d3-a456-426614174000',
          company_id: '123e4567-e89b-12d3-a456-426614174001',
          customer_id: '123e4567-e89b-12d3-a456-426614174002',
          customer_name: 'John Doe',
          conversation_source: 'whatsapp',
          conversation_status: 'active',
          assigned_status: false,
          starting_time: '2026-01-12T10:00:00.000Z',
          created_at: '2026-01-12T10:00:00.000Z',
          updated_at: '2026-01-12T10:00:00.000Z'
        },
        timestamp: '2026-01-12T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error'
  })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req
  ) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.createConversation(createConversationDto, company_id);
    return ResponseUtil.created('Conversation created successfully', result);
  }

  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all conversations',
    description: 'Retrieves all conversations for the company'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversations retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Conversations retrieved successfully',
        data: [
          {
            conversation_id: '123e4567-e89b-12d3-a456-426614174000',
            customer_name: 'John Doe',
            conversation_source: 'whatsapp',
            conversation_status: 'active',
            assigned_status: false,
            starting_time: '2026-01-12T10:00:00.000Z'
          }
        ],
        timestamp: '2026-01-12T10:00:00.000Z'
      }
    }
  })
  async findAll(@Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findAll(company_id);
    return ResponseUtil.success('Conversations retrieved successfully', result);
  }

  @Get('conversations/customer/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get conversations by customer ID',
    description: 'Retrieves all conversations for a specific customer'
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Customer conversations retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No conversations found for this customer'
  })
  async findOneByCustomerId(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findOneByCustomerId(id, company_id);
    return ResponseUtil.success('Customer conversations retrieved successfully', result);
  }

  @Get('conversations/employee/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get conversations by employee ID',
    description: 'Retrieves all conversations assigned to a specific employee'
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employee conversations retrieved successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No conversations found for this employee'
  })
  async findOneByEmployeeId(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findOneByEmployeeId(id, company_id);
    return ResponseUtil.success('Employee conversations retrieved successfully', result);
  }

  @Get('conversations/inbox/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get conversation details',
    description: 'Retrieves detailed information about a conversation including messages, tags, and summaries'
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation details retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Conversation details retrieved successfully',
        data: {
          conversation: {
            conversation_id: '123e4567-e89b-12d3-a456-426614174000',
            customer_name: 'John Doe',
            conversation_status: 'active'
          },
          messages: [],
          tags: [],
          summaries: []
        },
        timestamp: '2026-01-12T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Conversation not found'
  })
  async findConversationDetailsById(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findConversationDetailsById(id, company_id);
    return ResponseUtil.success('Conversation details retrieved successfully', result);
  }

  @Patch('conversations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update a conversation',
    description: 'Updates conversation details such as status, assignment, etc.'
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation updated successfully'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Conversation not found'
  })
  async updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @Request() req
  ) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.updateConversation(id, company_id, updateConversationDto);
    return ResponseUtil.success('Conversation updated successfully', result);
  }


  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new message',
    description: 'Adds a new message to a conversation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Message created successfully',
    schema: {
      example: {
        success: true,
        message: 'Message created successfully',
        data: {
          message_id: '123e4567-e89b-12d3-a456-426614174000',
          sender: 'user_123',
          conversation_id: '123e4567-e89b-12d3-a456-426614174001',
          sender_type: 'HUMAN',
          message: 'Hello, I need help',
          message_type: 'text',
          time: '2026-01-12T10:30:00.000Z',
          created_at: '2026-01-12T10:30:00.000Z'
        },
        timestamp: '2026-01-12T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Conversation not found'
  })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req
  ) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.createMessage(createMessageDto, company_id);
    return ResponseUtil.created('Message created successfully', result);
  }

  @Patch('messages/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update a message',
    description: 'Updates message content or metadata'
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Message updated successfully'
  })
  async updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req
  ) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.updateMessage(id, company_id, updateMessageDto);
    return ResponseUtil.success('Message updated successfully', result);
  }


  @Get('conversations/inbox/:id/recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get recent conversations for a user',
    description: 'Retrieves the 10 most recent conversations with summaries'
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent conversations retrieved successfully'
  })
  async findRecentConversationsByUserId(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findRecentConversationsByUserId(id, company_id);
    return ResponseUtil.success('Recent conversations retrieved successfully', result);
  }

  @Get('conversations/inbox/:id/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get order-related interactions',
    description: 'Retrieves all messages in a conversation related to orders'
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order interactions retrieved successfully'
  })
  async findOrdersByConversationId(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findOrdersByConversationId(id, company_id);
    return ResponseUtil.success('Order interactions retrieved successfully', result);
  }

  @Get('conversations/inbox/:id/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get product-related interactions',
    description: 'Retrieves all messages in a conversation related to products'
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product interactions retrieved successfully'
  })
  async findProductsByConversationId(@Param('id') id: string, @Request() req) {
    const company_id = req.companyId;
    const result = await this.messengerFactoryService.findProductsByConversationId(id, company_id);
    return ResponseUtil.success('Product interactions retrieved successfully', result);
  }
}