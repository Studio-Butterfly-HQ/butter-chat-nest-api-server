import { 
  Controller, Get, Query, Res, 
  BadRequestException, UnauthorizedException,
  Headers
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { type Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialConnection } from './entity/social-connection.entity';
import { Repository } from 'typeorm';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@ApiTags('auth/meta')
@Controller('auth/meta')
export class MetaBusinessController {
  private readonly GRAPH = 'https://graph.facebook.com/v21.0';

  constructor(
    @InjectRepository(SocialConnection)
    private socialConnectionRepo: Repository<SocialConnection>,
    private readonly configService: ConfigService,
  ) {}

  @Get('login')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Meta OAuth URL' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL' })
  async login(@Headers('authorization') authHeader: string) {
    // Extract and verify token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT and extract companyId
    let companyId: string;
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET')  || 'hello world';
      
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      // Decode and verify the token
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Extract companyId - adjust these fields based on your JWT payload structure
      companyId = decoded.companyId || decoded.company_id || decoded.sub;
      
      if (!companyId) {
        throw new UnauthorizedException('Company ID not found in token');
      }
      
      console.log('Authenticated company:', companyId);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');

    if (!appId || !redirectUri) {
      throw new BadRequestException('META_APP_ID and META_REDIRECT_URI must be configured');
    }

    // Create state with companyId
    const payload = {
      companyId,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };

    const state = Buffer.from(JSON.stringify(payload)).toString('base64');

    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_engagement',
      'pages_messaging',
      'pages_manage_metadata',
      'public_profile',
      'email',
    ].join(',');

    const url =
      `https://www.facebook.com/v24.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scopes}` +
      `&state=${state}` +
      `&auth_type=rerequest`;

    console.log('Generated Facebook OAuth URL for company:', companyId);
    
    // Return URL as JSON (frontend will redirect)
    return { url };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Meta OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect after OAuth completion' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_reason') errorReason: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    // Handle user denial
    if (error) {
      console.error('OAuth Error:', error, errorReason, errorDescription);
      return res.redirect(
        `https://app.studiobutterfly.io/onboarding?error=${encodeURIComponent(errorDescription || 'Access denied')}`,
      );
    }

    if (!code) {
      throw new BadRequestException('Authorization code missing');
    }

    if (!state) {
      throw new BadRequestException('State parameter missing');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');

    if (!appId || !appSecret || !redirectUri) {
      throw new BadRequestException('META credentials not configured');
    }

    try {
      // Decode and validate state
      let companyId: string;
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        companyId = decoded.companyId;
        
        // Optional: Validate timestamp (state shouldn't be older than 10 minutes)
        const stateAge = Date.now() - decoded.timestamp;
        if (stateAge > 10 * 60 * 1000) { // 10 minutes
          console.warn('State parameter is too old');
          return res.redirect(
            'https://app.studiobutterfly.io/onboarding?error=state_expired',
          );
        }
      } catch (err) {
        console.error('Invalid state parameter:', err);
        return res.redirect(
          'https://app.studiobutterfly.io/onboarding?error=invalid_state',
        );
      }

      if (!companyId) {
        console.error('Company ID not found in state');
        return res.redirect(
          'https://app.studiobutterfly.io/onboarding?error=company_id_missing',
        );
      }

      // Step 1: Exchange code for short-lived token
      const tokenRes = await axios.get(`${this.GRAPH}/oauth/access_token`, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const shortLivedToken = tokenRes.data.access_token;

      // Step 2: Convert to long-lived token (60 days)
      const longTokenRes = await axios.get(`${this.GRAPH}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      });

      const longLivedUserToken = longTokenRes.data.access_token;
      const expiresIn = longTokenRes.data.expires_in;

      // Step 3: Get user info
      const userRes = await axios.get(`${this.GRAPH}/me`, {
        params: {
          access_token: longLivedUserToken,
          fields: 'id,name,email,picture',
        },
      });

      const user = userRes.data;

      // Step 4: Get user's pages with tokens
      const pagesRes = await axios.get(`${this.GRAPH}/me/accounts`, {
        params: {
          access_token: longLivedUserToken,
          fields: 'id,name,access_token',
        },
      });

      const pages = pagesRes.data.data || [];

      console.log('=== OAUTH CALLBACK DEBUG ===');
      console.log(`User: ${user.name} (${user.id})`);
      console.log(`Pages Count: ${pages.length}`);

      if (pages.length === 0) {
        console.warn('NO PAGES FOUND - User may not manage any Facebook Pages');
      }

      // ==========================================
      // DATABASE INSERTION
      // ==========================================

      // Save user connection
      const existingUserConnection = await this.socialConnectionRepo.findOne({
        where: { id: user.id, company_id: companyId },
      });

      if (existingUserConnection) {
        // Update existing connection
        existingUserConnection.platform_token = longLivedUserToken;
        existingUserConnection.platform_name = 'Facebook';
        await this.socialConnectionRepo.save(existingUserConnection);
        console.log(`Updated user connection: ${user.id}`);
      } else {
        // Create new connection
        const userConnection = this.socialConnectionRepo.create({
          id: user.id,
          company_id: companyId,
          platform_name: 'Facebook',
          platform_type: 'user',
          platform_token: longLivedUserToken,
        });
        await this.socialConnectionRepo.save(userConnection);
        console.log(`Created new user connection: ${user.id}`);
      }

      // Save page connections
      for (const page of pages) {
        const existingPageConnection = await this.socialConnectionRepo.findOne({
          where: { id: page.id, company_id: companyId },
        });

        if (existingPageConnection) {
          // Update existing page connection
          existingPageConnection.platform_token = page.access_token;
          existingPageConnection.platform_name = page.name;
          await this.socialConnectionRepo.save(existingPageConnection);
          console.log(`Updated page connection: ${page.id} - ${page.name}`);
        } else {
          // Create new page connection
          const pageConnection = this.socialConnectionRepo.create({
            id: page.id,
            company_id: companyId,
            platform_name: page.name,
            platform_type: 'page',
            platform_token: page.access_token,
          });
          await this.socialConnectionRepo.save(pageConnection);
          console.log(`Created new page connection: ${page.id} - ${page.name}`);
        }
      }

      console.log(`Successfully connected Facebook for company: ${companyId}`);
      return res.redirect('https://app.studiobutterfly.io/onboarding?success=true');
    } catch (error: any) {
      console.error('OAuth Callback Error:', error.response?.data || error.message);
      return res.redirect('https://app.studiobutterfly.io/onboarding?error=oauth_failed');
    }
  }
}