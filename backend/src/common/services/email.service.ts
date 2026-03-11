import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection on startup (optional)
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
    } catch (error) {
      console.error('❌ Email service error:', error);
    }
  }

  async sendPasswordReset(to: string, resetLink: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"REMS System" <noreply@rems.gov.af>',
        to,
        subject: 'Password Reset Request - REMS',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Real Estate Management System</h1>
                        <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Ministry of Urban Development</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Password Reset Request</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
                          We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <!-- Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td style="background-color: #2563eb; border-radius: 6px;">
                              <a href="${resetLink}" 
                                 style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 20px 0; font-size: 14px;">
                          Or copy and paste this link into your browser:
                        </p>
                        
                        <p style="color: #2563eb; background-color: #f1f5f9; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 13px; margin: 0 0 20px 0;">
                          ${resetLink}
                        </p>
                        
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
                            <strong>⏱️ This link will expire in 1 hour.</strong>
                          </p>
                          <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 10px 0 0 0;">
                            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                          © ${new Date().getFullYear()} Real Estate Management System<br>
                          Ministry of Urban Development - Islamic Republic of Afghanistan
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `
Password Reset Request

We received a request to reset your password for your REMS account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email or contact support.

---
Real Estate Management System
Ministry of Urban Development
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  // Test email function (optional - for testing)
  async sendTestEmail(to: string) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Test Email - REMS',
        html: '<h1>Email service is working!</h1><p>This is a test email from REMS.</p>',
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  }
}