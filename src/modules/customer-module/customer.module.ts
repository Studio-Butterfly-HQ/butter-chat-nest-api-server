import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { Customer } from './entities/customer.entity';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';

/**
 * Customer Module
 * Manages all customer-related functionality including authentication
 */
@Module({
  imports: [
    // Import Customer entity for TypeORM
    TypeOrmModule.forFeature([Customer]),
    
    // Import Passport for authentication strategy
    PassportModule.register({ defaultStrategy: 'customer-jwt' }),
    
    // Import JWT module with async configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: 'customer-secret-key',
        signOptions: {
          expiresIn: '30d' // Long-term token validity
        }
      }),
      inject: [ConfigService]
    }),
    
    // Import ConfigModule for environment variables
    ConfigModule
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerRepository,
    CustomerJwtStrategy
  ],
  exports: [
    CustomerService,
    CustomerRepository
  ]
})
export class CustomerModule {}