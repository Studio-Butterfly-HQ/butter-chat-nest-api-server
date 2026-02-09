// src/modules/social-connection/repositories/social-connection.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SocialConnection } from '../meta_business_connection/entity/social-connection.entity';

@Injectable()
export class SocialConnectionRepository extends Repository<SocialConnection> {
  constructor(private dataSource: DataSource) {
    super(SocialConnection, dataSource.createEntityManager());
  }

  /**
   * Find all social connections for a specific company
   */
  async findByCompanyId(companyId: string): Promise<SocialConnection[]> {
    return this.find({
      where: { company_id: companyId },
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Find a specific social connection by ID and company ID
   * Ensures users can only access their own company's connections
   */
  async findByIdAndCompanyId(
    id: string,
    companyId: string,
  ): Promise<SocialConnection | null> {
    return this.findOne({
      where: { 
        id,
        company_id: companyId,
      },
    });
  }

  /**
   * Check if a platform connection already exists for a company
   */
  async existsByPlatformAndCompany(
    platformType: string,
    companyId: string,
  ): Promise<boolean> {
    const count = await this.count({
      where: {
        platform_type: platformType,
        company_id: companyId,
      },
    });
    return count > 0;
  }

  /**
   * Delete a social connection by ID and company ID
   * Returns true if deleted, false if not found
   */
  async deleteByIdAndCompanyId(
    id: string,
    companyId: string,
  ){
    const result = await this.delete({
      id,
      company_id: companyId,
    });
    return result;
  }

  /**
   * Create a new social connection
   */
  async createConnection(
    connectionData: Partial<SocialConnection>,
  ): Promise<SocialConnection> {
    const connection = this.create(connectionData);
    return this.save(connection);
  }

  /**
   * Count total connections for a company
   */
  async countByCompanyId(companyId: string): Promise<number> {
    return this.count({
      where: { company_id: companyId },
    });
  }

  /**
   * Get connections grouped by platform type
   */
  async findGroupedByPlatform(companyId: string): Promise<any> {
    return this.createQueryBuilder('sc')
      .select('sc.platform_type', 'platformType')
      .addSelect('COUNT(sc.id)', 'count')
      .where('sc.company_id = :companyId', { companyId })
      .groupBy('sc.platform_type')
      .getRawMany();
  }
}