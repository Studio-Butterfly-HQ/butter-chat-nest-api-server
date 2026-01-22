import { Controller, Get, Post, Query, Body, Res, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { Response } from 'express';

@Controller('auth/meta/')
export class MetaBusinessControllre {
  private readonly GRAPH = 'https://graph.facebook.com/v24.0';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === this.configService.get<string>("META_WEB_HOOK_VERIFY_TOKEN")) {
      return challenge;
    }
    throw new ForbiddenException('Webhook verification failed');
  }

  /**
   * Webhook events receiver
   */
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    console.log('WEBHOOK EVENT:', JSON.stringify(body, null, 2));

    // Always return 200
    return 'EVENT_RECEIVED';
  }
  // BUSINESS LOGIN (OAuth)
  @Get('login')
  login(@Res() res: Response) {
    const appId = this.configService.get<string>('META_APP_ID');
    const redirectUri =
      this.configService.get<string>('META_REDIRECT_URI') ||
      'https://api.studiobutterfly.io/auth/meta/callback';
    const configId = this.configService.get<string>('META_CONFIG_ID');

    const url =
  `https://www.facebook.com/dialog/oauth?` +
  `client_id=${appId}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&response_type=code` +
  `&scope=business_management,pages_show_list,pages_manage_posts,pages_messaging` +
  (configId ? `&config_id=${configId}` : '') +
  `&state=secure_state`;


    console.log('Redirecting to Facebook Login URL:', url);
    return res.redirect(url);
  }

  // OAUTH CALLBACK
  @Get('callback')
  async callback(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Authorization code missing');

    const appId = this.configService.get<string>('META_APP_ID')!;
    const appSecret = this.configService.get<string>('META_APP_SECRET')!;
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI')!;

    // Step A: Exchange code for short-lived token
    const tokenRes = await axios.get(`${this.GRAPH}/oauth/access_token`, {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      },
    });

    const shortLivedToken = tokenRes.data.access_token;

    // Step B: Convert to long-lived token
    const longTokenRes = await axios.get(`${this.GRAPH}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });

    const longLivedToken = longTokenRes.data.access_token;

    // TODO: Save longLivedToken in your DB per client

    return {
      message: 'Business connected successfully',
      token: longLivedToken,
    };
  }




  //................................................................................................................../
  // =========================
  // GET PAGES
  // =========================
  @Get('pages')
  async getPages(@Query('user_token') userToken: string) {
    if (!userToken) throw new BadRequestException('User token required');

    try {
      const res = await axios.get(`${this.GRAPH}/me/accounts`, {
        params: { access_token: userToken },
      });

      return res.data.data.map((p: any) => ({
        pageId: p.id,
        pageName: p.name,
        pageToken: p.access_token, // Use this for all page actions
        category: p.category,
        link: p.link,
        about: p.about || p.description || null,
        fanCount: p.fan_count || null,
      }));
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      throw new BadRequestException('Failed to fetch pages');
    }
  }

  // =========================
  // GET PAGE POSTS + COMMENTS
  // =========================
  @Get('page/posts')
  async getPosts(
    @Query('page_id') pageId: string,
    @Query('page_token') pageToken: string,
  ) {
    if (!pageId || !pageToken)
      throw new BadRequestException('Page ID and Page token required');
    const postsRes = await axios.get(`${this.GRAPH}/${pageId}/posts`, {
      params: {
        fields: 'id,message,full_picture,created_time',
        access_token: pageToken,
      },
    });

    const posts = postsRes.data.data || [];

    // Add comments
    for (const post of posts) {
      const commentsRes = await axios.get(`${this.GRAPH}/${post.id}/comments`, {
        params: {
          fields: 'from{name},message,created_time',
          access_token: pageToken,
        },
      });
      post.comments = commentsRes.data.data || [];
    }

    return posts;
  }

  // =========================
  // POST TO PAGE FEED
  // =========================
  @Post('page/post')
  async postToPage(
    @Body() body: { page_id: string; page_token: string; message: string },
  ) {
    if (!body.page_id || !body.page_token || !body.message)
      throw new BadRequestException('Page ID, Page token, and message are required');

    const res = await axios.post(`${this.GRAPH}/${body.page_id}/feed`, null, {
      params: {
        message: body.message,
        access_token: body.page_token,
      },
    });

    return res.data;
  }

  // =========================
  // SEND MESSENGER MESSAGE
  // =========================
@Post('message/send')
async sendMessage(
    @Body()
    body: {
        page_id: string;
        page_token: string;
        recipient_id: string;
        text: string;
    },
) {
    if (!body.page_token || !body.recipient_id || !body.text)
        throw new BadRequestException('Page token, recipient ID, and text required');

    const res = await axios.post(
        `${this.GRAPH}/${body.page_id}/messages`, // ← Changed from /me/messages
        {
            recipient: { id: body.recipient_id },
            message: { text: body.text },
        },
        { params: { access_token: body.page_token } },
    );

    return res.data;
}

  // =========================
  // GET PAGE CONVERSATIONS (optional)
  // =========================
  @Get('page/conversations')
  async getConversations(@Query('page_id') pageId: string, @Query('page_token') pageToken: string) {
    if (!pageId || !pageToken)
      throw new BadRequestException('Page ID and Page token required');

    const res = await axios.get(`${this.GRAPH}/${pageId}/conversations`, {
      params: {
        access_token: pageToken,
        fields: 'id,senders,updated_time,message_count',
      },
    });

    return res.data.data || [];
  }
  @Get('page/conversations/messages')
  async getConversationMessages(@Query('page_id') pageId: string, @Query('page_token') pageToken: string,) {
    if (!pageId || !pageToken)
      throw new BadRequestException('Page ID and Page token required');

    const res = await axios.get(`${this.GRAPH}/${pageId}/conversations`, {
      params: {
        access_token: pageToken,
        fields: 'id,senders,updated_time,message_count,messages{message,from,created_time}'
      },
    });
    return res.data.data || [];
  }

  @Get('user/info')
  async getUserInfo(@Query('user_access_token') userAccessToken:string){
          const res = await axios.get(`https://graph.facebook.com/v24.0/me`, {
      params: {
        access_token: userAccessToken,
        fields: 'id,name,email'
      },
    });
    return res.data || [];
  }

  @Get('debug/token')
  async debugToken(@Query('page_token') pageToken: string) {
      const res = await axios.get(`${this.GRAPH}/debug_token`, {
          params: {
              input_token: pageToken,
              access_token: pageToken
          }
      });
      return res.data;
  }

@Post('page/subscribe')
async subscribePage(
    @Body() body: { page_id: string; page_token: string }
) {
    console.log('Attempting to subscribe page:', body.page_id);
    
    try {
        // First, check current subscriptions
        const checkRes = await axios.get(
            `${this.GRAPH}/${body.page_id}/subscribed_apps`,
            {
                params: { 
                    access_token: body.page_token 
                }
            }
        );
        
        console.log('Currently subscribed apps:', JSON.stringify(checkRes.data, null, 2));

        // Subscribe the app
        const subRes = await axios.post(
            `${this.GRAPH}/${body.page_id}/subscribed_apps`,
            null,
            {
                params: {
                    subscribed_fields: 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads',
                    access_token: body.page_token
                }
            }
        );

        console.log('Subscription response:', JSON.stringify(subRes.data, null, 2));

        return {
            success: true,
            subscription: subRes.data,
            currentSubscriptions: checkRes.data
        };
    } catch (error: any) {
        // Better error logging
        console.error('=== SUBSCRIPTION ERROR ===');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);
        
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}
}

//'https://hal-prescribable-tatiana.ngrok-free.dev/auth/meta/page/callback'