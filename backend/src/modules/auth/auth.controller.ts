/**
 * Authentication controller
 * Handles HTTP requests for user authentication operations
 *
 * Filename: auth.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-04
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import authService from "./auth.service";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

/**
 * Register a new user account
 */
// [AI-GENERATED: Claude, 2025-08-04]
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);

    // Set secure HTTP-only cookie with JWT token
    res
      .cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 3600000 * 24 * 7, // 7 days
      })
      .status(201)
      .json({ message: "Registration successful", user: result.user.id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Authenticate user login
 */
// [AI-GENERATED: Claude, 2025-08-04]
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set secure HTTP-only cookie with JWT token
    res
      .cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 3600000 * 24 * 7, // 7 days
      })
      .status(200)
      .json({ message: "Login successful", user: result.user.id });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

/**
 * Log out current user by clearing authentication cookie
 */
export const logout = async (_req: Request, res: Response) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
    })
    .status(200)
    .json({ message: "Logged out successfully." });
};

/**
 * Check authentication status and return user information
 */
// [AI-GENERATED: Claude, 2025-08-09]
export const status = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(200)
        .json({ valid: false, message: "No token provided, unauthorized." });
    }

    // Verify JWT token and extract user ID
    const decoded = jwt.verify(token, SECRET_KEY);
    let userId: string | undefined;
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      userId = (decoded as { userId: string }).userId;
    }

    if (!userId) {
      return res
        .status(401)
        .json({ valid: false, message: "Invalid token payload" });
    }

    // Fetch user details and return authentication status
    const user = await authService.getUserById(userId);
    res.status(200).json({
      valid: true,
      userId: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err: any) {
    res
      .status(401)
      .json({ valid: false, message: err.message || "Unknown error" });
  }
};
