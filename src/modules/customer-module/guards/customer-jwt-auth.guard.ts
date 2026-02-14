import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Customer JWT Authentication Guard
 * Protects routes that require customer authentication
 */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('customer-jwt') {
  /**
   * Determines if the request can proceed
   * @param context - Execution context
   * @returns Boolean indicating if request is authorized
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const customer = request.user;

    // Validate customer data exists in token
    if (!customer || !customer.customerId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Attach customer information to request object for easy access in controllers
    request.customerId = customer.customerId;
    request.companyId = customer.companyId;
    request.customerSource = customer.source;
    request.customerContact = customer.contact;
    request.customerName = customer.name;

    return true;
  }

  /**
   * Handles the request after validation
   * @param err - Any error that occurred
   * @param customer - Customer data from JWT
   * @param info - Additional info
   * @returns Customer data or throws error
   */
  handleRequest(err: any, customer: any, info: any) {
    if (err || !customer) {
      throw err || new UnauthorizedException('Customer authentication failed');
    }
    return customer;
  }
}