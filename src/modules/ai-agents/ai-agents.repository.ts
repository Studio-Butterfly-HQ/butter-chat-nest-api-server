import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AiAgent } from "./entities/ai-agent.entity";
import { CreateAiAgentDto } from "./dto/create-ai-agent.dto";
import { UpdateAiAgentDto } from "./dto/update-ai-agent.dto";

@Injectable()
export class AiAgentsRepository {
  constructor(
    @InjectRepository(AiAgent)
    private readonly aiAgentRepository: Repository<AiAgent>
  ) {}

  /**
   * Creates a new AI agent in the database
   * @param data - The AI agent data including company_id
   * @returns The created AI agent
   */
  async create(data: CreateAiAgentDto & { company_id: string }): Promise<AiAgent> {
    const aiAgent = this.aiAgentRepository.create(data);
    return await this.aiAgentRepository.save(aiAgent);
  }

  /**
   * Finds all AI agents belonging to a specific company
   * @param companyId - The company ID
   * @returns Array of AI agents
   */
  async findAllByCompany(companyId: string): Promise<AiAgent[]> {
    return await this.aiAgentRepository.find({
      where: { company_id: companyId },
      order: { createdDate: 'DESC' }
    });
  }

  /**
   * Finds a single AI agent by ID and company ID
   * @param id - The AI agent ID
   * @param companyId - The company ID
   * @returns The AI agent or null
   */
  async findOneByIdAndCompany(id: string, companyId: string): Promise<AiAgent | null> {
    return await this.aiAgentRepository.findOne({
      where: { 
        id,
        company_id: companyId 
      }
    });
  }

  /**
   * Finds an AI agent by name and company ID
   * @param agentName - The agent name
   * @param companyId - The company ID
   * @returns The AI agent or null
   */
  async findByNameAndCompany(agentName: string, companyId: string): Promise<AiAgent | null> {
    return await this.aiAgentRepository.findOne({
      where: {
        agent_name: agentName,
        company_id: companyId
      }
    });
  }

  /**
   * Updates an AI agent
   * @param id - The AI agent ID
   * @param data - The update data
   * @returns The updated AI agent
   */
  async update(id: string, data: UpdateAiAgentDto): Promise<AiAgent> {
    await this.aiAgentRepository.update(id, data);
    const updatedAgent = await this.aiAgentRepository.findOne({ where: { id } });
    
    if (!updatedAgent) {
      throw new Error(`AI agent with ID '${id}' not found after update`);
    }
    
    return updatedAgent;
  }

  /**
   * Deletes an AI agent
   * @param id - The AI agent ID
   */
  async delete(id: string): Promise<void> {
    await this.aiAgentRepository.delete(id);
  }

  /**
   * Counts the total number of AI agents for a company
   * @param companyId - The company ID
   * @returns The count of AI agents
   */
  async countByCompany(companyId: string): Promise<number> {
    return await this.aiAgentRepository.count({
      where: { company_id: companyId }
    });
  }
}