// src/modules/messenger-factory/messenger-factory.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/coversation.entity';
import { Message } from './entities/message.entity';
import { ConversationTag } from './entities/conversation-tag.entity';
import { ConversationSummary } from './entities/conversation-summary.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessengerFactoryRepository {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ConversationTag)
    private conversationTagRepository: Repository<ConversationTag>,
    @InjectRepository(ConversationSummary)
    private conversationSummaryRepository: Repository<ConversationSummary>,
  ) {}

  // Conversation CRUD
  async createConversation(createConversationDto: CreateConversationDto, company_id: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      ...createConversationDto,
      company_id,
      conversation_status: 'active',
      assigned_status: false,
    });
    return await this.conversationRepository.save(conversation);
  }

  async findAllConversations(company_id: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { company_id },
      relations: ['messages', 'tags', 'summaries'],
      order: { createdDate: 'DESC' }
    });
  }

  async findConversationById(conversation_id: string, company_id: string): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({
      where: { conversation_id, company_id },
      relations: ['messages', 'tags', 'summaries']
    });
  }

  async findConversationsByCustomerId(customer_id: string, company_id: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { customer_id, company_id },
      relations: ['messages', 'tags', 'summaries'],
      order: { createdDate: 'DESC' }
    });
  }

  async findConversationsByEmployeeId(assigned_to: string, company_id: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { assigned_to, company_id },
      relations: ['messages', 'tags', 'summaries'],
      order: { createdDate: 'DESC' }
    });
  }

  async updateConversation(
    conversation_id: string,
    company_id: string,
    updateConversationDto: UpdateConversationDto
  ): Promise<Conversation> {
    await this.conversationRepository.update(
      { conversation_id, company_id },
      updateConversationDto
    );
    const conversation = await this.findConversationById(conversation_id, company_id);
    if (!conversation) {
      throw new Error('Conversation not found after update');
    }
    return conversation;
  }

  // Message CRUD
  async createMessage(createMessageDto: CreateMessageDto, company_id: string): Promise<Message> {
    const message = this.messageRepository.create({
      ...createMessageDto,
      company_id,
      edit_status: createMessageDto.edit_status || false,
    });
    return await this.messageRepository.save(message);
  }

  async findMessagesByConversationId(conversation_id: string, company_id: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversation_id, company_id },
      order: { time: 'ASC' }
    });
  }

  async updateMessage(
    message_id: string,
    company_id: string,
    updateMessageDto: UpdateMessageDto
  ): Promise<Message> {
    await this.messageRepository.update(
      { message_id, company_id },
      updateMessageDto
    );
    const message = await this.messageRepository.findOne({
      where: { message_id, company_id }
    });
    if (!message) {
      throw new Error('Message not found after update');
    }
    return message;
  }

  // Tags
  async findTagsByConversationId(conversation_id: string, company_id: string): Promise<ConversationTag[]> {
    return await this.conversationTagRepository.find({
      where: { conversation_id, company_id }
    });
  }

  // Summaries
  async findSummariesByConversationId(conversation_id: string, company_id: string): Promise<ConversationSummary[]> {
    return await this.conversationSummaryRepository.find({
      where: { conversation_id, company_id },
      order: { generated_at: 'DESC' }
    });
  }

  // Recent conversations
  async findRecentConversationsByCustomerId(customer_id: string, company_id: string, limit: number = 10): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { customer_id, company_id },
      relations: ['summaries'],
      order: { createdDate: 'DESC' },
      take: limit
    });
  }
}