/**
 * Filename: auth.middleware.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-04
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  userId: string;
}

// [AI-GENERATED: Claude, 2025-08-04]
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check token in Authorization header
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded?.userId) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Attach user info to request
    (req as any).user = {
      id: decoded.userId,
    };

    next();
  } catch (err: any) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// [AI-GENERATED: Claude, 2025-08-13]
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded?.userId) {
      (req as any).user = {
        id: decoded.userId,
      };
    }

    next();
  } catch (err: any) {
    console.error("Optional authentication error:", err);
    next();
  }
};
