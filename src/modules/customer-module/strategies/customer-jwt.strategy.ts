import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerRepository } from '../customer.repository';
import { CustomerSource } from '../entities/customer.entity';

/**
 * JWT Payload interface for customer authentication
 */
export interface CustomerJwtPayload {
  sub: string; // customer id
  companyId: string;
  source: CustomerSource;
  contact: string;
  iat?: number;
  exp?: number;
}

/**
 * Customer JWT Strategy
 * Validates JWT tokens for customer authentication
 */
@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt' // Named strategy for customer authentication
) {
  constructor(
    private configService: ConfigService,
    private customerRepository: CustomerRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('CUSTOMER_JWT_SECRET') || 
                   configService.get<string>('JWT_SECRET') || 
                   'customer-secret-key'
    });
  }

  /**
   * Validates the JWT payload and retrieves customer information
   * @param payload - JWT payload
   * @returns Validated customer data
   * @throws UnauthorizedException if customer not found
   */
  async validate(payload: CustomerJwtPayload) {
    // Find customer by ID
    const customer = await this.customerRepository.findCustomerById(payload.sub);
    
    console.log('Customer JWT Strategy - Customer:', customer);
    
    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    // Verify the customer belongs to the correct company and source
    if (customer.company_id !== payload.companyId || customer.source !== payload.source) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return customer data to be attached to request
    return {
      customerId: customer.id,
      companyId: customer.company_id,
      source: customer.source,
      contact: customer.contact,
      name: customer.name
    };
  }
}