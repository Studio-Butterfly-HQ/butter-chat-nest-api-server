import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAiAgentDto } from './dto/create-ai-agent.dto';
import { UpdateAiAgentDto } from './dto/update-ai-agent.dto';
import { AiAgentsRepository } from './ai-agents.repository';
import { AiAgent } from './entities/ai-agent.entity';

@Injectable()
export class AiAgentsService {
  constructor(private readonly aiAgentsRepository: AiAgentsRepository) {}

  /**
   * Creates a new AI agent for a company
   * @param companyId - The ID of the company creating the agent
   * @param createAiAgentDto - The data for creating the AI agent
   * @returns The created AI agent
   */
  async create(companyId: string, createAiAgentDto: CreateAiAgentDto): Promise<AiAgent> {
    try {
      // Check if agent name already exists for this company
      const existingAgent = await this.aiAgentsRepository.findByNameAndCompany(
        createAiAgentDto.agent_name,
        companyId
      );

      if (existingAgent) {
        throw new BadRequestException(
          `An AI agent with the name '${createAiAgentDto.agent_name}' already exists for this company`
        );
      }

      return await this.aiAgentsRepository.create({
        ...createAiAgentDto,
        company_id: companyId
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create AI agent');
    }
  }

  /**
   * Retrieves all AI agents for a specific company
   * @param companyId - The ID of the company
   * @returns Array of AI agents
   */
  async findAllByCompany(companyId: string): Promise<AiAgent[]> {
    try {
      return await this.aiAgentsRepository.findAllByCompany(companyId);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve AI agents');
    }
  }

  /**
   * Retrieves a specific AI agent by ID
   * @param id - The ID of the AI agent
   * @param companyId - The ID of the company (for authorization)
   * @returns The AI agent
   */
  async findOne(id: string, companyId: string): Promise<AiAgent> {
    const agent = await this.aiAgentsRepository.findOneByIdAndCompany(id, companyId);
    
    if (!agent) {
      throw new NotFoundException(`AI agent with ID '${id}' not found`);
    }

    return agent;
  }

  /**
   * Updates an existing AI agent
   * @param id - The ID of the AI agent to update
   * @param companyId - The ID of the company (for authorization)
   * @param updateAiAgentDto - The updated data
   * @returns The updated AI agent
   */
  async update(
    id: string,
    companyId: string,
    updateAiAgentDto: UpdateAiAgentDto
  ): Promise<AiAgent> {
    // Verify the agent exists and belongs to the company
    const existingAgent = await this.findOne(id, companyId);

    // If updating agent name, check for duplicates
    if (updateAiAgentDto.agent_name && updateAiAgentDto.agent_name !== existingAgent.agent_name) {
      const duplicateAgent = await this.aiAgentsRepository.findByNameAndCompany(
        updateAiAgentDto.agent_name,
        companyId
      );

      if (duplicateAgent && duplicateAgent.id !== id) {
        throw new BadRequestException(
          `An AI agent with the name '${updateAiAgentDto.agent_name}' already exists for this company`
        );
      }
    }

    try {
      return await this.aiAgentsRepository.update(id, updateAiAgentDto);
    } catch (error) {
      throw new BadRequestException('Failed to update AI agent');
    }
  }

  /**
   * Deletes an AI agent
   * @param id - The ID of the AI agent to delete
   * @param companyId - The ID of the company (for authorization)
   */
  async remove(id: string, companyId: string): Promise<void> {
    // Verify the agent exists and belongs to the company
    await this.findOne(id, companyId);

    try {
      await this.aiAgentsRepository.delete(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete AI agent');
    }
  }
}