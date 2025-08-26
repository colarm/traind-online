/**
 * Filename: internal.middleware.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-18
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-18
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response, NextFunction } from "express";

// [AI-GENERATED: Claude, 2025-08-18]
export const internalOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract client IP address considering reverse proxy headers
  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  // Primary authentication: Internal API key validation
  const internalApiKey = process.env.INTERNAL_API_KEY;
  const providedKey =
    req.headers["x-internal-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  const hasValidKey = internalApiKey && providedKey === internalApiKey;

  // Secondary authentication: Internal request header (set by nginx/proxy)
  const isInternalRequest = req.headers["x-internal-request"] === "true";

  // Development convenience: Allow localhost access in non-production
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isLocalhost =
    isDevelopment &&
    (clientIP === "127.0.0.1" ||
      clientIP === "::1" ||
      clientIP?.includes("127.0.0.1") ||
      clientIP?.includes("::1"));

  // Grant access if any authentication method succeeds
  if (hasValidKey || isInternalRequest || isLocalhost) {
    return next();
  }

  // Security logging for unauthorized access attempts
  console.warn(
    `Unauthorized access attempt to internal API from IP: ${clientIP}, User-Agent: ${req.headers["user-agent"]}`
  );

  // Deny access with forbidden status
  return res.status(403).json({
    error: "Forbidden: This endpoint is for internal use only",
  });
};
