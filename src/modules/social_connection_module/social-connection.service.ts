// src/modules/social-connection/social-connection.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SocialConnectionRepository } from './social-connection.repository';
import { CreateSocialConnectionDto } from './dto/create-social-connection.dto';
import { SocialConnection } from '../meta_business_connection/entity/social-connection.entity';

@Injectable()
export class SocialConnectionService {
  constructor(
    private readonly socialConnectionRepository: SocialConnectionRepository,
  ) {}

  /**
   * Get all social connections for a company
   */
  async findAllByCompany(companyId: string): Promise<SocialConnection[]> {
    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    const connections = await this.socialConnectionRepository.findByCompanyId(
      companyId,
    );

    // Mask tokens in response for security
    return connections.map((connection) => this.maskToken(connection));
  }

  /**
   * Get a specific social connection by ID
   */
  async findOne(id: string, companyId: string): Promise<SocialConnection> {
    if (!id) {
      throw new BadRequestException('Connection ID is required');
    }

    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    const connection =
      await this.socialConnectionRepository.findByIdAndCompanyId(id, companyId);

    if (!connection) {
      throw new NotFoundException(
        `Social connection with ID ${id} not found or access denied`,
      );
    }

    return this.maskToken(connection);
  }

  /**
   * Create a new social connection
   */
  async create(
    createDto: CreateSocialConnectionDto,
    companyId: string,
  ): Promise<SocialConnection> {
    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    // Check if connection already exists for this platform
    const exists = await this.socialConnectionRepository.existsByPlatformAndCompany(
      createDto.platform_type,
      companyId,
    );

    if (exists) {
      throw new ConflictException(
        `A ${createDto.platform_type} connection already exists for this company. Please delete the existing one first.`,
      );
    }

    const connection = await this.socialConnectionRepository.createConnection({
      ...createDto,
      company_id: companyId,
    });

    return this.maskToken(connection);
  }

  /**
   * Delete a social connection
   */
  async delete(id: string, companyId: string): Promise<{ id: string }> {
    if (!id) {
      throw new BadRequestException('Connection ID is required');
    }

    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    // First check if it exists
    const connection =
      await this.socialConnectionRepository.findByIdAndCompanyId(id, companyId);

    if (!connection) {
      throw new NotFoundException(
        `Social connection with ID ${id} not found or access denied`,
      );
    }

    // Delete it
    const deleted = await this.socialConnectionRepository.deleteByIdAndCompanyId(
      id,
      companyId,
    );

    if (!deleted) {
      throw new NotFoundException(
        `Failed to delete social connection with ID ${id}`,
      );
    }

    return { id };
  }

  /**
   * Get connection statistics for a company
   */
  async getStats(companyId: string): Promise<{
    total: number;
    byPlatform: Array<{ platformType: string; count: number }>;
  }> {
    if (!companyId) {
      throw new BadRequestException('Company ID is required');
    }

    const total = await this.socialConnectionRepository.countByCompanyId(
      companyId,
    );
    const byPlatform = await this.socialConnectionRepository.findGroupedByPlatform(
      companyId,
    );

    return {
      total,
      byPlatform: byPlatform.map((item) => ({
        platformType: item.platformType,
        count: parseInt(item.count, 10),
      })),
    };
  }

  /**
   * Mask token for security (show only first 8 characters)
   */
  private maskToken(connection: SocialConnection): SocialConnection {
    if (connection.platform_token) {
      const visibleChars = 8;
      connection.platform_token =
        connection.platform_token.substring(0, visibleChars) + '****';
    }
    return connection;
  }

  /**
   * Verify a connection token (placeholder - implement actual verification)
   */
  async verifyConnection(id: string, companyId: string): Promise<{
    valid: boolean;
    message: string;
  }> {
    const connection = await this.findOne(id, companyId);

    // todo-> Implement actual platform-specific token verification
    // for now, just check if token exists
    const valid = !!connection.platform_token;

    return {
      valid,
      message: valid
        ? 'Connection token is valid'
        : 'Connection token is invalid or expired',
    };
  }
}