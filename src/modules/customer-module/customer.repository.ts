import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Customer, CustomerSource } from './entities/customer.entity';

/**
 * Repository for Customer entity
 * Handles all database operations related to customers
 */
@Injectable()
export class CustomerRepository extends Repository<Customer> {
  constructor(private dataSource: DataSource) {
    super(Customer, dataSource.createEntityManager());
  }

  /**
   * Find a customer by ID
   * @param id - Customer UUID
   * @returns Customer entity or null
   */
  async findCustomerById(id: string): Promise<Customer | null> {
    return await this.findOne({
      where: { id },
      select: [
        'id',
        'company_id',
        'name',
        'profile_uri',
        'contact',
        'source',
        'conversation_count',
        'createdDate',
        'updatedDate'
      ]
    });
  }

  /**
   * Find a customer by company_id, contact, and source (unique combination)
   * @param company_id - Company UUID
   * @param contact - Customer contact (email or phone)
   * @param source - Registration source
   * @returns Customer entity or null
   */
  async findByUniqueIdentity(
    company_id: string,
    contact: string,
    source: CustomerSource
  ): Promise<Customer | null> {
    return await this.findOne({
      where: { company_id, contact, source }
    });
  }

  /**
   * Find a customer by unique identity including password (for authentication)
   * @param company_id - Company UUID
   * @param contact - Customer contact
   * @param source - Registration source
   * @returns Customer entity with password or null
   */
  async findByUniqueIdentityWithPassword(
    company_id: string,
    contact: string,
    source: CustomerSource
  ): Promise<Customer | null> {
    return await this.findOne({
      where: { company_id, contact, source },
      select: [
        'id',
        'company_id',
        'name',
        'profile_uri',
        'contact',
        'password',
        'source',
        'conversation_count',
        'createdDate',
        'updatedDate'
      ]
    });
  }

  /**
   * Create a new customer
   * @param customerData - Partial customer data
   * @returns Created customer entity
   */
  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.create(customerData);
    return await this.save(customer);
  }

  /**
   * Update customer information
   * @param id - Customer UUID
   * @param updateData - Partial customer data to update
   * @returns Updated customer entity or null
   */
  async updateCustomer(
    id: string,
    updateData: Partial<Customer>
  ): Promise<Customer | null> {
    await this.update(id, updateData);
    return await this.findCustomerById(id);
  }

  /**
   * Delete a customer by ID
   * @param id - Customer UUID
   * @returns Deletion result
   */
  async deleteCustomer(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if a customer exists by unique identity
   * @param company_id - Company UUID
   * @param contact - Customer contact
   * @param source - Registration source
   * @returns Boolean indicating existence
   */
  async existsByUniqueIdentity(
    company_id: string,
    contact: string,
    source: CustomerSource
  ): Promise<boolean> {
    const count = await this.count({
      where: { company_id, contact, source }
    });
    return count > 0;
  }

  /**
   * Increment conversation count for a customer
   * @param id - Customer UUID
   * @returns Updated customer
   */
  async incrementConversationCount(id: string): Promise<Customer | null> {
    await this.increment({ id }, 'conversation_count', 1);
    return await this.findCustomerById(id);
  }
}