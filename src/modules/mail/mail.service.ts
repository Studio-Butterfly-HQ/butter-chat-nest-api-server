// src/modules/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendInvitationEmail(
    email: string,
    inviteToken: string,
    companyName: string
  ) {
    const resetUrl = `${this.configService.get('FRONTEND_EMPLOYEE_INVITE_URL')}?token=${inviteToken}`;
    
    const mailOptions = {
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: `Welcome to ${companyName} - Account Created`,
      html: this.getWelcomeEmailTemplate(email,resetUrl, companyName),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getWelcomeEmailTemplate(
    email: string,
    resetUrl: string,
    companyName: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f7;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
              <tr>
                  <td align="center">
                      <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                          <!-- Header -->
                          <tr>
                              <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">You're Invited!</h1>
                              </td>
                          </tr>
                          
                          <!-- Body -->
                          <tr>
                              <td style="padding: 40px;">
                                  <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                      Hi <strong>${email}</strong>,
                                  </p>
                                  
                                  <p style="margin: 0 0 20px; color: #1d1d1f; font-size: 16px; line-height: 1.6;">
                                      You've been invited to join <strong>${companyName}</strong> on our AI-powered platform. Let's collaborate and build something amazing together.
                                  </p>
                                  
                                  <p style="margin: 0 0 30px; color: #86868b; font-size: 14px; line-height: 1.6;">
                                      Click the button below to accept your invitation and set up your account.
                                  </p>
                                  
                                  <!-- CTA Button -->
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                      <tr>
                                          <td align="center" style="padding: 20px 0;">
                                              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                                                  Accept Invitation
                                              </a>
                                          </td>
                                      </tr>
                                  </table>
                                  
                                  <p style="margin: 30px 0 0; color: #86868b; font-size: 13px; line-height: 1.6;">
                                      Or copy and paste this link into your browser:<br>
                                      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                                  </p>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e5e5e7;">
                                  <p style="margin: 0; color: #86868b; font-size: 12px; line-height: 1.5; text-align: center;">
                                      This invitation expires in 1 hour.<br>
                                      If you didn't expect this invitation, you can safely ignore this email.
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
  }
}