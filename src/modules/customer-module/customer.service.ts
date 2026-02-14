import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CustomerRepository } from './customer.repository';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerSource } from './entities/customer.entity';

/**
 * Customer Service
 * Handles all business logic for customer operations
 */
@Injectable()
export class CustomerService {
  private readonly saltRounds = 10;

  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Register a new customer
   * @param registerDto - Registration data
   * @returns Created customer and JWT token
   * @throws ConflictException if customer already exists
   */
  async register(registerDto: RegisterCustomerDto) {
    const { company_id, contact, source, password, name, profile_uri } = registerDto;

    // Set default source if not provided
    const customerSource = source || CustomerSource.WEB;

    // Check if customer already exists with same company_id, contact, and source
    const existingCustomer = await this.customerRepository.findByUniqueIdentity(
      company_id,
      contact,
      customerSource
    );

    if (existingCustomer) {
      throw new ConflictException(
        'Customer already exists with this contact and source for the company'
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create customer
    const customer = await this.customerRepository.createCustomer({
      company_id,
      contact,
      source: customerSource,
      password: hashedPassword,
      name,
      profile_uri,
      conversation_count: 0
    });

    // Generate JWT token
    const token = await this.generateToken(customer);

    // Remove password from response
    const { password: _, ...customerData } = customer;

    return {
      access_token: token,
      customer: customerData
    };
  }

  /**
   * Login a customer
   * @param loginDto - Login credentials
   * @returns Customer data and JWT token
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginCustomerDto) {
    const { company_id, contact, source, password } = loginDto;

    // Find customer with password
    const customer = await this.customerRepository.findByUniqueIdentityWithPassword(
      company_id,
      contact,
      source
    );

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken(customer);

    // Remove password from response
    const { password: _, ...customerData } = customer;

    return {
      access_token: token,
      customer: customerData
    };
  }

  /**
   * Get customer profile by ID
   * @param customerId - Customer UUID
   * @param companyId - Company UUID for validation
   * @returns Customer data
   * @throws NotFoundException if customer not found
   */
  async getCustomerById(customerId: string, companyId: string): Promise<Customer> {
    const customer = await this.customerRepository.findCustomerById(customerId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify customer belongs to the correct company
    if (customer.company_id !== companyId) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  /**
   * Update customer profile
   * @param customerId - Customer UUID
   * @param companyId - Company UUID for validation
   * @param updateDto - Update data
   * @returns Updated customer data
   * @throws NotFoundException if customer not found
   */
  async updateCustomer(
    customerId: string,
    companyId: string,
    updateDto: UpdateCustomerDto
  ): Promise<Customer> {
    // Verify customer exists and belongs to company
    const customer = await this.getCustomerById(customerId, companyId);

    // Prepare update data
    const updateData: Partial<Customer> = {};

    if (updateDto.name) {
      updateData.name = updateDto.name;
    }

    if (updateDto.profile_uri !== undefined) {
      updateData.profile_uri = updateDto.profile_uri;
    }

    if (updateDto.password) {
      // Hash new password
      updateData.password = await bcrypt.hash(updateDto.password, this.saltRounds);
    }

    // Update customer
    const updatedCustomer = await this.customerRepository.updateCustomer(
      customerId,
      updateData
    );

    if (!updatedCustomer) {
      throw new NotFoundException('Customer not found after update');
    }

    return updatedCustomer;
  }

  /**
   * Delete customer account
   * @param customerId - Customer UUID
   * @param companyId - Company UUID for validation
   * @returns Deletion result
   * @throws NotFoundException if customer not found
   */
  async deleteCustomer(customerId: string, companyId: string): Promise<boolean> {
    // Verify customer exists and belongs to company
    await this.getCustomerById(customerId, companyId);

    // Delete customer
    const deleted = await this.customerRepository.deleteCustomer(customerId);

    if (!deleted) {
      throw new NotFoundException('Customer not found');
    }

    return deleted;
  }

  /**
   * Generate JWT token for customer
   * @param customer - Customer entity
   * @returns JWT token string
   */
  private async generateToken(customer: Customer): Promise<string> {
    const payload = {
      sub: customer.id,
      companyId: customer.company_id,
      source: customer.source,
      contact: customer.contact
    };

    const secret = this.configService.get<string>('CUSTOMER_JWT_SECRET') || 
                   this.configService.get<string>('JWT_SECRET') || 
                   'customer-secret-key';

    // Generate long-term token (30 days)
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '30d'
    });
  }
}