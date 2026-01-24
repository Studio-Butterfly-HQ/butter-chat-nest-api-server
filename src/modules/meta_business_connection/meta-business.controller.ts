import { 
  Controller, Get, Post, Query, Body, Res, 
  BadRequestException, ForbiddenException, Session, 
  UseGuards,
  Req
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { Response } from 'express';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialConnection } from './entity/social-connection.entity';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate Meta OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirect to Meta OAuth' })
  async login(@Session() session: any, @Res() res: Response, @Req() req: any) {
    const appId = this.configService.get<string>('META_APP_ID');
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');

    if (!appId || !redirectUri) {
      throw new BadRequestException('META_APP_ID and META_REDIRECT_URI must be configured');
    }

    // Get company ID from authenticated request
    const companyId = req.companyId;

    if (!companyId) {
      throw new BadRequestException('Company ID not found in request');
    }

    // Generate and store state for CSRF protection
    const crypto = require('crypto');
    const state = crypto.randomBytes(32).toString('hex');

    // Store state and company ID in session for callback
    if (session) {
      session.oauthState = state;
      session.companyId = companyId; // Store company ID from req.companyId
    }

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
      `&auth_type=rerequest`; // Forces permission dialog

    console.log('Redirecting to Facebook OAuth for company:', companyId);
    return res.redirect(url);
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
    @Session() session: any,
    @Res() res: Response,
  ) {
    // Handle user denial
    if (error) {
      console.error('OAuth Error:', error, errorReason, errorDescription);
      return res.redirect(
        `/auth/meta/error?message=${encodeURIComponent(errorDescription || 'Access denied')}`,
      );
    }

    if (!code) {
      throw new BadRequestException('Authorization code missing');
    }

    // Validate state (CSRF protection)
    if (session && session.oauthState !== state) {
      console.error('State mismatch - possible CSRF attack');
      throw new ForbiddenException('Invalid state parameter');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');

    if (!appId || !appSecret || !redirectUri) {
      throw new BadRequestException('META credentials not configured');
    }

    try {
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

      // Get company_id from session (stored during login)
      const companyId = session?.companyId;

      if (!companyId) {
        console.error('Company ID not found in session');
        return res.redirect(
          'https://app.studiobutterfly.io/onboarding?error=company_id_missing',
        );
      }

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

      // Return authentication data
      const authData = {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        userToken: longLivedUserToken,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        pages: pages.map((page) => ({
          pageId: page.id,
          pageName: page.name,
          pageToken: page.access_token,
        })),
      };

      // Clear session state before redirect
      if (session) {
        delete session.oauthState;
        delete session.companyId;
      }

      return res.redirect('https://app.studiobutterfly.io/onboarding?success=true');
    } catch (error: any) {
      console.error('OAuth Callback Error:', error.response?.data || error.message);
      
      // Clear session on error too
      if (session) {
        delete session.oauthState;
        delete session.companyId;
      }
      
      return res.redirect('https://app.studiobutterfly.io/onboarding?error=oauth_failed');
    }
  }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all social connections for company' })
  @ApiResponse({ status: 200, description: 'Social connections retrieved successfully' })
  async getConnections(@Req() req: any) {
    const companyId = req.companyId;

    if (!companyId) {
      throw new BadRequestException('Company ID not found in request');
    }

    const connections = await this.socialConnectionRepo.find({
      where: { company_id: companyId },
      order: { createdDate: 'DESC' },
    });

    return {
      success: true,
      message: 'Social connections retrieved successfully',
      data: connections,
    };
  }
  // =========================
  // GET PAGES (for authenticated users)
  // =========================
  @Get('pages')
  async getPages(@Query('user_token') userToken: string) {
    if (!userToken) {
      throw new BadRequestException('User token required');
    }

    try {
      const res = await axios.get(`${this.GRAPH}/me/accounts`, {
        params: {
          access_token: userToken,
          fields: 'id,name,access_token', // Minimal fields
        },
      });

      const pages = res.data.data || [];

      if (pages.length === 0) {
        console.warn('No pages found for this user');
      }

      return {
        success: true,
        count: pages.length,
        pages: pages.map((p: any) => ({
          pageId: p.id,
          pageName: p.name,
          pageToken: p.access_token, // This token gives you access to EVERYTHING
        })),
      };
    } catch (err: any) {
      console.error('Get Pages Error:', err.response?.data || err.message);
      
      // Check if token is expired
      if (err.response?.data?.error?.code === 190) {
        throw new ForbiddenException('Token expired. Please re-authenticate.');
      }
      
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch pages'
      );
    }
  }











  //.............................................................................
  // =========================
  // REFRESH USER TOKEN
  // =========================
  @Post('token/refresh')
  async refreshToken(@Body() body: { user_token: string }) {
    if (!body.user_token) {
      throw new BadRequestException('User token required');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException('META credentials not configured');
    }

    try {
      const res = await axios.get(`${this.GRAPH}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: body.user_token,
        },
      });

      const newToken = res.data.access_token;
      const expiresIn = res.data.expires_in;

      return {
        success: true,
        accessToken: newToken,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      };
    } catch (err: any) {
      console.error('Token Refresh Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to refresh token'
      );
    }
  }

  // =========================
  // GET PAGE POSTS + COMMENTS
  // =========================
  @Get('page/posts')
  async getPosts(
    @Query('page_id') pageId: string,
    @Query('page_token') pageToken: string,
    @Query('limit') limit?: string,
  ) {
    if (!pageId || !pageToken) {
      throw new BadRequestException('Page ID and Page token required');
    }

    try {
      const postsRes = await axios.get(`${this.GRAPH}/${pageId}/posts`, {
        params: {
          fields: 'id,message,full_picture,created_time,permalink_url,likes.summary(true),comments.summary(true),shares',
          access_token: pageToken,
          limit: limit ? parseInt(limit) : 25,
        },
      });

      const posts = postsRes.data.data || [];

      // Optionally fetch comments for each post
      for (const post of posts) {
        if (post.comments?.summary?.total_count > 0) {
          const commentsRes = await axios.get(`${this.GRAPH}/${post.id}/comments`, {
            params: {
              fields: 'id,from{name,id},message,created_time,like_count',
              access_token: pageToken,
              limit: 10,
            },
          });
          post.commentsList = commentsRes.data.data || [];
        }
      }

      return {
        success: true,
        count: posts.length,
        posts: posts,
        paging: postsRes.data.paging,
      };
    } catch (err: any) {
      console.error('Get Posts Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch posts'
      );
    }
  }

  // =========================
  // POST TO PAGE FEED
  // =========================
  @Post('page/post')
  async postToPage(
    @Body() body: {
      page_id: string;
      page_token: string;
      message: string;
      link?: string;
      published?: boolean;
    },
  ) {
    if (!body.page_id || !body.page_token || !body.message) {
      throw new BadRequestException('Page ID, Page token, and message are required');
    }

    try {
      const params: any = {
        message: body.message,
        access_token: body.page_token,
        published: body.published !== false, // Default to true
      };

      if (body.link) {
        params.link = body.link;
      }

      const res = await axios.post(`${this.GRAPH}/${body.page_id}/feed`, null, {
        params,
      });

      return {
        success: true,
        postId: res.data.id,
        data: res.data,
      };
    } catch (err: any) {
      console.error('Post to Page Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create post'
      );
    }
  }

  // =========================
  // SEND MESSENGER MESSAGE
  // =========================
  @Post('message/send')
  async sendMessage(
    @Body() body: {
      page_id: string;
      page_token: string;
      recipient_id: string;
      text: string;
    },
  ) {
    if (!body.page_token || !body.recipient_id || !body.text) {
      throw new BadRequestException('Page token, recipient ID, and text required');
    }

    try {
      const res = await axios.post(
        `${this.GRAPH}/${body.page_id}/messages`,
        {
          recipient: { id: body.recipient_id },
          message: { text: body.text },
          messaging_type: 'RESPONSE', // or 'UPDATE', 'MESSAGE_TAG'
        },
        { params: { access_token: body.page_token } },
      );

      return {
        success: true,
        messageId: res.data.message_id,
        recipientId: res.data.recipient_id,
      };
    } catch (err: any) {
      console.error('Send Message Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to send message'
      );
    }
  }

  // =========================
  // GET PAGE CONVERSATIONS
  // =========================
  @Get('page/conversations')
  async getConversations(
    @Query('page_id') pageId: string,
    @Query('page_token') pageToken: string,
  ) {
    if (!pageId || !pageToken) {
      throw new BadRequestException('Page ID and Page token required');
    }

    try {
      const res = await axios.get(`${this.GRAPH}/${pageId}/conversations`, {
        params: {
          access_token: pageToken,
          fields: 'id,senders,updated_time,message_count,unread_count',
          limit: 50,
        },
      });

      return {
        success: true,
        conversations: res.data.data || [],
        paging: res.data.paging,
      };
    } catch (err: any) {
      console.error('Get Conversations Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch conversations'
      );
    }
  }

  @Get('conversation/messages')
  async getConversationMessages(
    @Query('conversation_id') conversationId: string,
    @Query('page_token') pageToken: string,
  ) {
    if (!conversationId || !pageToken) {
      throw new BadRequestException('Conversation ID and Page token required');
    }

    try {
      const res = await axios.get(`${this.GRAPH}/${conversationId}/messages`, {
        params: {
          access_token: pageToken,
          fields: 'id,message,from,created_time,attachments',
          limit: 100,
        },
      });

      return {
        success: true,
        messages: res.data.data || [],
        paging: res.data.paging,
      };
    } catch (err: any) {
      console.error('Get Messages Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch messages'
      );
    }
  }

  // =========================
  // DEBUG TOKEN
  // =========================
  @Get('debug/token')
  async debugToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token required');
    }

    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const appToken = `${appId}|${appSecret}`;

    try {
      const res = await axios.get(`${this.GRAPH}/debug_token`, {
        params: {
          input_token: token,
          access_token: appToken,
        },
      });

      return {
        success: true,
        data: res.data.data,
      };
    } catch (err: any) {
      console.error('Debug Token Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to debug token'
      );
    }
  }

  // =========================
  // SUBSCRIBE PAGE TO WEBHOOKS
  // =========================
  @Post('page/subscribe')
  async subscribePage(@Body() body: { page_id: string; page_token: string }) {
    if (!body.page_id || !body.page_token) {
      throw new BadRequestException('Page ID and Page token required');
    }

    try {
      const subRes = await axios.post(
        `${this.GRAPH}/${body.page_id}/subscribed_apps`,
        null,
        {
          params: {
            subscribed_fields: [
              'messages',
              'messaging_postbacks',
              'messaging_optins',
              'message_deliveries',
              'message_reads',
              'feed',
              'mention',
            ].join(','),
            access_token: body.page_token,
          },
        },
      );

      return {
        success: true,
        subscription: subRes.data,
      };
    } catch (error: any) {
      console.error('=== SUBSCRIPTION ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Error:', JSON.stringify(error.response?.data, null, 2));

      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  }

  // =========================
  // GET USER INFO
  // =========================
  @Get('user/info')
  async getUserInfo(@Query('user_access_token') userAccessToken: string) {
    if (!userAccessToken) {
      throw new BadRequestException('User access token required');
    }

    try {
      const res = await axios.get(`${this.GRAPH}/me`, {
        params: {
          access_token: userAccessToken,
          fields: 'id,name,email,picture',
        },
      });

      return {
        success: true,
        user: res.data,
      };
    } catch (err: any) {
      console.error('Get User Info Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch user info'
      );
    }
  }

  // =========================
  // DELETE POST
  // =========================
  @Post('page/post/delete')
  async deletePost(
    @Body() body: { post_id: string; page_token: string },
  ) {
    if (!body.post_id || !body.page_token) {
      throw new BadRequestException('Post ID and Page token required');
    }

    try {
      const res = await axios.delete(`${this.GRAPH}/${body.post_id}`, {
        params: {
          access_token: body.page_token,
        },
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (err: any) {
      console.error('Delete Post Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to delete post'
      );
    }
  }

  // =========================
  // REPLY TO COMMENT
  // =========================
  @Post('page/comment/reply')
  async replyToComment(
    @Body() body: {
      comment_id: string;
      page_token: string;
      message: string;
    },
  ) {
    if (!body.comment_id || !body.page_token || !body.message) {
      throw new BadRequestException('Comment ID, Page token, and message required');
    }

    try {
      const res = await axios.post(
        `${this.GRAPH}/${body.comment_id}/comments`,
        null,
        {
          params: {
            message: body.message,
            access_token: body.page_token,
          },
        },
      );

      return {
        success: true,
        commentId: res.data.id,
      };
    } catch (err: any) {
      console.error('Reply to Comment Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to reply to comment'
      );
    }
  }

  // =========================
  // GET PAGE INSIGHTS (Analytics)
  // =========================
  @Get('page/insights')
  async getPageInsights(
    @Query('page_id') pageId: string,
    @Query('page_token') pageToken: string,
    @Query('metric') metric?: string,
  ) {
    if (!pageId || !pageToken) {
      throw new BadRequestException('Page ID and Page token required');
    }

    const defaultMetrics = [
      'page_impressions',
      'page_impressions_unique',
      'page_engaged_users',
      'page_post_engagements',
      'page_fans',
      'page_fan_adds',
      'page_fan_removes',
    ];

    try {
      const res = await axios.get(`${this.GRAPH}/${pageId}/insights`, {
        params: {
          metric: metric || defaultMetrics.join(','),
          access_token: pageToken,
          period: 'day',
        },
      });

      return {
        success: true,
        insights: res.data.data || [],
      };
    } catch (err: any) {
      console.error('Get Insights Error:', err.response?.data || err.message);
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to fetch insights'
      );
    }
  }

  // =========================
  // VERIFY APP SETUP
  // =========================
  @Get('verify/setup')
  async verifySetup() {
    const appId = this.configService.get<string>('META_APP_ID');
    const appSecret = this.configService.get<string>('META_APP_SECRET');
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');
    const webhookToken = this.configService.get<string>('META_WEB_HOOK_VERIFY_TOKEN');

    return {
      success: true,
      config: {
        appId: appId ? '✓ Set' : '✗ Missing',
        appSecret: appSecret ? '✓ Set' : '✗ Missing',
        redirectUri: redirectUri || '✗ Missing',
        webhookToken: webhookToken ? '✓ Set' : '✗ Missing',
      },
      endpoints: {
        login: '/auth/meta/login',
        callback: '/auth/meta/callback',
        webhook: '/auth/meta/webhook',
        pages: '/auth/meta/pages',
        posts: '/auth/meta/page/posts',
        createPost: '/auth/meta/page/post',
        sendMessage: '/auth/meta/message/send',
        conversations: '/auth/meta/page/conversations',
      },
    };
  }

  // =========================
  // TEST TOKEN & PAGES (for debugging)
  // =========================
  @Get('test/token')
  async testToken(@Query('user_token') userToken: string) {
    if (!userToken) {
      throw new BadRequestException('user_token query parameter required');
    }

    try {
      // Test 1: Verify token is valid
      console.log('Testing token...');
      const appId = this.configService.get<string>('META_APP_ID');
      const appSecret = this.configService.get<string>('META_APP_SECRET');
      
      const debugRes = await axios.get(`${this.GRAPH}/debug_token`, {
        params: {
          input_token: userToken,
          access_token: `${appId}|${appSecret}`,
        },
      });

      console.log('Token Debug Info:', JSON.stringify(debugRes.data, null, 2));

      // Test 2: Get user info
      const userRes = await axios.get(`${this.GRAPH}/me`, {
        params: {
          access_token: userToken,
          fields: 'id,name,email',
        },
      });

      console.log('User Info:', userRes.data);

      // Test 3: Try to get pages with detailed error logging
      console.log('Fetching pages...');
      const pagesRes = await axios.get(`${this.GRAPH}/me/accounts`, {
        params: {
          access_token: userToken,
          fields: 'id,name,access_token,category,link,about,fan_count,tasks',
        },
      });

      console.log('Pages API Response:', JSON.stringify(pagesRes.data, null, 2));

      const pages = pagesRes.data.data || [];

      return {
        success: true,
        tokenValid: true,
        tokenInfo: debugRes.data.data,
        user: userRes.data,
        pagesCount: pages.length,
        pages: pages,
        troubleshooting: pages.length === 0 ? {
          issue: 'No pages found',
          possibleReasons: [
            '1. User does not manage any Facebook Pages',
            '2. Missing pages_show_list permission',
            '3. App is in Development Mode and user needs to be added as Tester',
          ],
          solutions: [
            'Create a test page at: https://www.facebook.com/pages/create',
            'Make sure you are an Admin of the page',
            'Re-authenticate to grant permissions',
          ]
        } : null,
      };
    } catch (err: any) {
      console.error('Test Token Error:', err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data || err.message,
        message: 'Token test failed. See error details above.',
      };
    }
  }
}