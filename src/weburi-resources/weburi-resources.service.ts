import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateWeburiResourceDto } from './dto/create-weburi-resource.dto';
import { UpdateWeburiResourceDto } from './dto/update-weburi-resource.dto';
import { WeburiResource, WeburiResourceStatus } from './entities/weburi-resource.entity';
import { WeburiResourcesRepository } from './weburi-resources.repository';

@Injectable()
export class WeburiResourcesService {
  constructor(
    private readonly weburiResourcesRepository: WeburiResourcesRepository,
  ) {}

  /**
   * Create a new WebURI resource for a company
   */
  async create(
    companyId: string,
    createWeburiResourceDto: CreateWeburiResourceDto
  ): Promise<WeburiResource> {
    // Check if URI already exists for this company
    const exists = await this.weburiResourcesRepository.existsByUriAndCompanyId(
      createWeburiResourceDto.uri,
      companyId
    );

    if (exists) {
      throw new ConflictException('URI already exists for this company');
    }

    const weburiResource = this.weburiResourcesRepository.create({
      ...createWeburiResourceDto,
      company_id: companyId,
    });

    return await this.weburiResourcesRepository.save(weburiResource);
  }

  /**
   * Get all WebURI resources for a company
   */
  async findAllByCompany(companyId: string): Promise<WeburiResource[]> {
    return await this.weburiResourcesRepository.findByCompanyId(companyId);
  }

  /**
   * Get resources by status for a company
   */
  async findByCompanyAndStatus(
    companyId: string,
    status: WeburiResourceStatus
  ): Promise<WeburiResource[]> {
    return await this.weburiResourcesRepository.findByCompanyIdAndStatus(companyId, status);
  }

  /**
   * Get synced resources for a company
   */
  async findSyncedByCompany(companyId: string): Promise<WeburiResource[]> {
    return await this.weburiResourcesRepository.findSyncedByCompanyId(companyId);
  }

  /**
   * Get queued resources for a company
   */
  async findQueuedByCompany(companyId: string): Promise<WeburiResource[]> {
    return await this.weburiResourcesRepository.findQueuedByCompanyId(companyId);
  }

  /**
   * Get failed resources for a company
   */
  async findFailedByCompany(companyId: string): Promise<WeburiResource[]> {
    return await this.weburiResourcesRepository.findFailedByCompanyId(companyId);
  }

  /**
   * Get a single WebURI resource by ID for a specific company
   */
  async findOne(id: string, companyId: string): Promise<WeburiResource> {
    const weburiResource = await this.weburiResourcesRepository.findOne({
      where: { id, company_id: companyId },
    });

    if (!weburiResource) {
      throw new NotFoundException(`WebURI Resource with ID ${id} not found`);
    }

    return weburiResource;
  }

  /**
   * Update a WebURI resource
   */
  async update(
    id: string,
    companyId: string,
    updateWeburiResourceDto: UpdateWeburiResourceDto
  ): Promise<WeburiResource> {
    const weburiResource = await this.findOne(id, companyId);

    // If updating URI, check for duplicates
    if (updateWeburiResourceDto.uri && updateWeburiResourceDto.uri !== weburiResource.uri) {
      const exists = await this.weburiResourcesRepository.existsByUriAndCompanyId(
        updateWeburiResourceDto.uri,
        companyId
      );

      if (exists) {
        throw new ConflictException('URI already exists for this company');
      }
    }

    Object.assign(weburiResource, updateWeburiResourceDto);

    return await this.weburiResourcesRepository.save(weburiResource);
  }

  /**
   * Delete a WebURI resource
   */
  async remove(id: string, companyId: string): Promise<void> {
    const weburiResource = await this.findOne(id, companyId);
    await this.weburiResourcesRepository.remove(weburiResource);
  }

  /**
   * Mark a resource as synced
   */
  async markAsSynced(id: string, companyId: string): Promise<WeburiResource> {
    return await this.update(id, companyId, { status: WeburiResourceStatus.SYNCED });
  }

  /**
   * Mark a resource as queued
   */
  async markAsQueued(id: string, companyId: string): Promise<WeburiResource> {
    return await this.update(id, companyId, { status: WeburiResourceStatus.QUEUED });
  }

  /**
   * Mark a resource as failed
   */
  async markAsFailed(id: string, companyId: string): Promise<WeburiResource> {
    return await this.update(id, companyId, { status: WeburiResourceStatus.FAILED });
  }

  /**
   * Bulk update status for multiple resources
   */
  async bulkUpdateStatus(
    ids: string[],
    companyId: string,
    status: WeburiResourceStatus
  ): Promise<WeburiResource[]> {
    const resources = await Promise.all(
      ids.map(id => this.update(id, companyId, { status }))
    );
    return resources;
  }
}