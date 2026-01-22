// src/modules/messenger-factory/messenger-factory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { MessengerFactoryRepository } from './messenger-factory.repository';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessengerFactoryService {
  constructor(
    private readonly messengerRepository: MessengerFactoryRepository
  ) {}

  // Conversation methods
  async createConversation(createConversationDto: CreateConversationDto, company_id: string) {
    return await this.messengerRepository.createConversation(createConversationDto, company_id);
  }

  async findAll(company_id: string) {
    return await this.messengerRepository.findAllConversations(company_id);
  }

  async findOneByCustomerId(customer_id: string, company_id: string) {
    const conversations = await this.messengerRepository.findConversationsByCustomerId(customer_id, company_id);
    if (!conversations || conversations.length === 0) {
      throw new NotFoundException('No conversations found for this customer');
    }
    return conversations;
  }

  async findOneByEmployeeId(assigned_to: string, company_id: string) {
    const conversations = await this.messengerRepository.findConversationsByEmployeeId(assigned_to, company_id);
    if (!conversations || conversations.length === 0) {
      throw new NotFoundException('No conversations found for this employee');
    }
    return conversations;
  }

  async findConversationDetailsById(conversation_id: string, company_id: string) {
    const conversation = await this.messengerRepository.findConversationById(conversation_id, company_id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messengerRepository.findMessagesByConversationId(conversation_id, company_id);
    const tags = await this.messengerRepository.findTagsByConversationId(conversation_id, company_id);
    const summaries = await this.messengerRepository.findSummariesByConversationId(conversation_id, company_id);

    return {
      conversation,
      messages,
      tags,
      summaries
    };
  }

  async updateConversation(conversation_id: string, company_id: string, updateConversationDto: UpdateConversationDto) {
    const conversation = await this.messengerRepository.findConversationById(conversation_id, company_id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return await this.messengerRepository.updateConversation(conversation_id, company_id, updateConversationDto);
  }

  // Message methods
  async createMessage(createMessageDto: CreateMessageDto, company_id: string) {
    const conversation = await this.messengerRepository.findConversationById(
      createMessageDto.conversation_id,
      company_id
    );
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return await this.messengerRepository.createMessage(createMessageDto, company_id);
  }

  async updateMessage(message_id: string, company_id: string, updateMessageDto: UpdateMessageDto) {
    return await this.messengerRepository.updateMessage(message_id, company_id, updateMessageDto);
  }

  // Interaction methods
  async findRecentConversationsByUserId(customer_id: string, company_id: string) {
    const conversations = await this.messengerRepository.findRecentConversationsByCustomerId(
      customer_id,
      company_id,
      10
    );
    
    return conversations.map(conv => ({
      conversation_id: conv.conversation_id,
      customer_name: conv.customer_name,
      starting_time: conv.starting_time,
      conversation_status: conv.conversation_status,
      summary: conv.summaries?.[0]?.summary_text || 'No summary available'
    }));
  }

  async findOrdersByConversationId(conversation_id: string, company_id: string) {
    const messages = await this.messengerRepository.findMessagesByConversationId(conversation_id, company_id);
    
    // Filter messages related to orders based on message_intend
    const orderMessages = messages.filter(msg => 
      msg.message_intend?.includes('order') || 
      msg.message.toLowerCase().includes('order')
    );

    return {
      conversation_id,
      order_related_messages: orderMessages,
      count: orderMessages.length
    };
  }

  async findProductsByConversationId(conversation_id: string, company_id: string) {
    const messages = await this.messengerRepository.findMessagesByConversationId(conversation_id, company_id);
    
    // Filter messages related to products based on message_intend
    const productMessages = messages.filter(msg => 
      msg.message_intend?.includes('product') || 
      msg.message.toLowerCase().includes('product')
    );

    return {
      conversation_id,
      product_related_messages: productMessages,
      count: productMessages.length
    };
  }
}