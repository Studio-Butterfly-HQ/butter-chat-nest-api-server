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
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .credentials-box {
            background-color: #fff;
            border: 2px solid #4F46E5;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
          }
          .credentials-box h3 {
            margin-top: 0;
            color: #4F46E5;
          }
          .credential-item {
            margin: 10px 0;
            padding: 10px;
            background-color: #f3f4f6;
            border-radius: 3px;
          }
          .credential-label {
            font-weight: bold;
            color: #666;
            display: block;
            margin-bottom: 5px;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            color: #1f2937;
            font-size: 16px;
          }
          .reset-button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .reset-button:hover {
            background-color: #4338CA;
          }
          .warning-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to ${companyName}!</h1>
        </div>
        
        <div class="content">
          
          <p>Your account is pending list</p>   
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">
              Reset Password Now
            </a>
          </div>
          
          <p style="margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 3px;">
            ${resetUrl}
          </p>
          
          <p style="margin-top: 30px;">
            If you didn't expect this email or have any questions, please contact your administrator.
          </p>
          
          <p>Best regards,<br><strong>${companyName} Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}