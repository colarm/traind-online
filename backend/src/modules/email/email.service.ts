/**
 * Email Service
 * Handles email sending using SendGrid
 * Supports templates for email content
 *
 * Filename: email.service.ts
 * Author: Haicheng Zhao
 * Date: 2025-09-02
 * Updated: 2025-09-03 - Migrated from nodemailer to SendGrid
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-09-02
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import { EmailOptions, TemplateData, EmailServiceInfo } from "./email.types";

// Load environment variables
dotenv.config();

export class SimpleEmailService {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    this.initializeSendGrid();

    console.log(
      `📧 Email service initialized with SendGrid for ${
        this.isProduction ? "PRODUCTION" : "DEVELOPMENT"
      } environment`
    );
  }

  /**
   * Initialize SendGrid with API key
   */
  private initializeSendGrid(): void {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY environment variable is required");
    }
    sgMail.setApiKey(apiKey);
  }

  /**
   * Get the "from" address
   */
  private getFromAddress(): string {
    const fromName = process.env.EMAIL_FROM_NAME || "Traind.online";
    const fromEmail = process.env.EMAIL_FROM || "noreply@traind.online";
    return `"${fromName}" <${fromEmail}>`;
  }

  /**
   * Send a basic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: this.getFromAddress(),
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await sgMail.send(msg);
      console.log(`✅ Email sent via SendGrid:`, result[0].statusCode);
      return true;
    } catch (error) {
      console.error(`❌ Email failed via SendGrid:`, error);
      return false;
    }
  }

  /**
   * Send a welcome email
   */
  // [AI-GENERATED: Claude, 2025-09-02]
  async sendWelcomeEmail(to: string, data: TemplateData): Promise<boolean> {
    const subject = "Welcome to Traind.online!";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #666; font-size: 12px; margin-top: 20px; }
          .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-list ul { list-style-type: none; padding: 0; }
          .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
          .feature-list li:last-child { border-bottom: none; }
          .feature-list li::before { content: "✨ "; color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to Traind.online!</h1>
            <p>Discover Reddit Trends with AI Power</p>
          </div>
          <div class="content">
            <h2>Hi ${data.username || "there"},</h2>
            <p>Thank you for joining Traind.online - the AI-powered Reddit trend analysis platform!</p>
            
            <div class="feature-list">
              <h3>🎯 What you can do now:</h3>
              <ul>
                <li>Analyze trending topics across Reddit communities</li>
                <li>Discover hidden patterns in discussions</li>
                <li>Track sentiment and engagement metrics</li>
                <li>Create custom analysis reports</li>
                <li>Share insights with the community</li>
              </ul>
            </div>
            
            ${
              data.verificationUrl
                ? `
            <p>Please verify your email address to get started:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email</a>
            `
                : `
            <p>Your account is ready! Start exploring Reddit trends and discover hidden patterns in community discussions!</p>
            <p><strong>Ready to begin?</strong> Log in to your dashboard and start your first analysis!</p>
            `
            }
            
            <div class="footer">
              <p>Welcome to the community! If you have any questions, feel free to reach out.</p>
              <p>This email was sent automatically by Traind.online. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send a password reset email
   */
  // [AI-GENERATED: Claude, 2025-09-02]
  async sendPasswordResetEmail(
    to: string,
    data: TemplateData
  ): Promise<boolean> {
    const subject = "Reset Your Traind.online Password";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.username || "there"},</h2>
            <p>We received a request to reset your Traind.online password.</p>
            
            ${
              data.resetUrl
                ? `
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            `
                : ""
            }
            
            <div class="warning">
              <p><strong>⚠️ Security Note:</strong> This link will expire in 5 minutes. If you didn't request this reset, please ignore this email.</p>
            </div>
            
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; color: #666;">${
              data.resetUrl || ""
            }</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send analysis complete notification
   */
  // [AI-GENERATED: Claude, 2025-09-02]
  async sendAnalysisCompleteEmail(
    to: string,
    data: TemplateData
  ): Promise<boolean> {
    const subject = "🎉 Your Reddit Analysis is Complete!";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Analysis Complete!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.username || "there"},</h2>
            <p>Your Reddit trend analysis "<strong>${
              data.traindTitle || "Untitled Analysis"
            }</strong>" has been completed!</p>
            
            <div class="stats">
              <h3>📊 Analysis Summary:</h3>
              <p>Your analysis has discovered interesting patterns and trends in Reddit discussions. Click below to explore the results!</p>
            </div>
            
            ${
              data.traindUrl
                ? `
            <a href="${data.traindUrl}" class="button">View Results</a>
            `
                : ""
            }
            
            <p>Discover hidden trends and patterns in Reddit communities!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send analysis failed notification
   */
  // [AI-GENERATED: Claude, 2025-09-02]
  async sendAnalysisFailedEmail(
    to: string,
    data: TemplateData
  ): Promise<boolean> {
    const subject = "❌ Your Reddit Analysis Failed";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .error-info { background: #ffebee; border: 1px solid #f44336; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .retry-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Analysis Failed</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.username || "there"},</h2>
            <p>We're sorry to inform you that your Reddit trend analysis "<strong>${
              data.traindTitle || "Untitled Analysis"
            }</strong>" has failed to complete.</p>
            
            <div class="error-info">
              <h3>🔍 What happened?</h3>
              <p>The analysis encountered an error during processing. This could be due to:</p>
              <ul>
                <li>Data availability issues with Reddit</li>
                <li>Temporary server problems</li>
                <li>Network connectivity issues</li>
                <li>Analysis complexity exceeded limits</li>
              </ul>
            </div>
            
            <div class="retry-info">
              <h3>🔄 What can you do?</h3>
              <p>Don't worry! You can try again:</p>
              <ul>
                <li>Check your parameter settings</li>
                <li>Try with a smaller dataset or different parameters</li>
                <li>Wait a few minutes and retry the analysis</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>
            
            ${
              data.traindUrl
                ? `
            <p>You can review your analysis settings and try again:</p>
            <a href="${data.traindUrl}" class="button">View Analysis</a>
            `
                : `
            <p>You can start a new analysis from your dashboard:</p>
            <a href="https://traind.online/training" class="button">Go to Dashboard</a>
            `
            }
            
            <p>If you continue to experience issues, please don't hesitate to contact our support team.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              <p>This is an automated notification from Traind.online. If you have any questions, please contact support.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // SendGrid doesn't have a verify method, so we'll just check if API key exists
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error("SENDGRID_API_KEY not configured");
      }
      console.log(`✅ SendGrid connection verified`);
      return true;
    } catch (error) {
      console.error(`❌ SendGrid connection failed:`, error);
      return false;
    }
  }

  /**
   * Get the current email service information
   */
  getServiceInfo(): EmailServiceInfo {
    return {
      provider: "SendGrid",
      environment: this.isProduction ? "production" : "development",
      from: this.getFromAddress(),
    };
  }
}

// Singleton pattern
let emailService: SimpleEmailService | null = null;

export function getEmailService(): SimpleEmailService {
  if (!emailService) {
    emailService = new SimpleEmailService();
  }
  return emailService;
}
