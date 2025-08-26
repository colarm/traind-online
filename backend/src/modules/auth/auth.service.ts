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

const prisma = new PrismaClient();

/**
 * Generate JWT token for user authentication
 */
function getToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

const authService = {
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
};

export default authService;
