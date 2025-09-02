/**
 * Email Types
 * Type definitions for email module
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface TemplateData {
  username?: string;
  verificationUrl?: string;
  resetUrl?: string;
  traindTitle?: string;
  traindUrl?: string;
  [key: string]: any;
}

export interface EmailServiceInfo {
  provider: string;
  environment: string;
  from: string;
}
