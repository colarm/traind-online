/**
 * Filename: error.middleware.ts
 * Author: Haicheng Zhao
 * Date: 2025-07-31
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-07-31
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response, NextFunction } from "express";

// [AI-GENERATED: Claude, 2025-07-31]
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error details for debugging
  console.error("❌ Error:", err);

  // Extract status code and message with defaults
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Return standardized error response
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
