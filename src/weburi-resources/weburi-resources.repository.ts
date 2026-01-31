import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WeburiResource, WeburiResourceStatus } from './entities/weburi-resource.entity';

@Injectable()
export class WeburiResourcesRepository extends Repository<WeburiResource> {
  constructor(private dataSource: DataSource) {
    super(WeburiResource, dataSource.createEntityManager());
  }

  /**
   * Find all WebURI resources for a specific company
   */
  async findByCompanyId(companyId: string): Promise<WeburiResource[]> {
    return this.find({
      where: { company_id: companyId },
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Find resources by status for a specific company
   */
  async findByCompanyIdAndStatus(
    companyId: string,
    status: WeburiResourceStatus
  ): Promise<WeburiResource[]> {
    return this.find({
      where: { company_id: companyId, status },
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Find synced resources for a specific company
   */
  async findSyncedByCompanyId(companyId: string): Promise<WeburiResource[]> {
    return this.findByCompanyIdAndStatus(companyId, WeburiResourceStatus.SYNCED);
  }

  /**
   * Find queued resources for a specific company
   */
  async findQueuedByCompanyId(companyId: string): Promise<WeburiResource[]> {
    return this.findByCompanyIdAndStatus(companyId, WeburiResourceStatus.QUEUED);
  }

  /**
   * Find failed resources for a specific company
   */
  async findFailedByCompanyId(companyId: string): Promise<WeburiResource[]> {
    return this.findByCompanyIdAndStatus(companyId, WeburiResourceStatus.FAILED);
  }

  /**
   * Check if a URI already exists for a company
   */
  async existsByUriAndCompanyId(uri: string, companyId: string): Promise<boolean> {
    const count = await this.count({
      where: { uri, company_id: companyId },
    });
    return count > 0;
  }
}