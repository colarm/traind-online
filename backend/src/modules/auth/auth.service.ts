/**
 * Authentication service
 * Handles user registration, login, and token management
 *
 * Filename: auth.service.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-04
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getEmailService } from "../email/email.service";

const prisma = new PrismaClient();
const emailService = getEmailService();

/**
 * Generate JWT token for user authentication
 */
function getToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

/**
 * Generate secure random token for password reset
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const authService = {
  /**
   * Clean up expired password reset tokens
   */
  async cleanupExpiredTokens() {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`Cleaned up ${result.count} expired password reset tokens`);
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  },

  /**
   * Register a new user account
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async register(email: string, username: string, password: string) {
    // Check for existing email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error("Email already exists");

    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) throw new Error("Username already exists");

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed },
    });

    // Send welcome email (don't wait for it to complete)
    emailService
      .sendWelcomeEmail(user.email, {
        username: user.username,
      })
      .catch((error) => {
        console.error("Failed to send welcome email:", error);
      });

    const token = getToken(user.id);

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    };
  },

  /**
   * Authenticate user login
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User does not exist");

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Password is incorrect");

    const token = getToken(user.id);

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    };
  },

  /**
   * Get user by ID for authentication verification
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  /**
   * Request password reset - send reset email with secure token
   */
  async requestPasswordReset(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: "If the email exists, a reset link has been sent" };
    }

    // Generate secure random token
    const resetToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Clean up any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset token record
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // Create reset URL
    const frontendUrl = "https://traind.online";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, {
        username: user.username,
        resetUrl: resetUrl,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }

    return { message: "If the email exists, a reset link has been sent" };
  },

  /**
   * Reset password using database token
   */
  async resetPassword(token: string, newPassword: string) {
    // Find the password reset token
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetTokenRecord) {
      throw new Error("Invalid reset token");
    }

    // Check if token has expired
    if (resetTokenRecord.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetTokenRecord.id },
      });
      throw new Error("Reset token has expired");
    }

    // Check if token has already been used
    if (resetTokenRecord.used) {
      throw new Error("Reset token has already been used");
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { used: true },
    });

    return { message: "Password reset successfully" };
  },
};

export default authService;
