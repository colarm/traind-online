import { Request, Response, NextFunction } from "express";

/**
 * Middleware to protect internal API endpoints
 * Only allows access with valid internal API key
 * Note: IP-based filtering is not reliable with reverse proxies like nginx
 */
export const internalOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get client IP address (considering reverse proxy headers)
  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  // Check for internal API key (primary authentication method)
  const internalApiKey = process.env.INTERNAL_API_KEY;
  const providedKey =
    req.headers["x-internal-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  const hasValidKey = internalApiKey && providedKey === internalApiKey;

  // Check for internal request header (set by nginx or other proxy)
  const isInternalRequest = req.headers["x-internal-request"] === "true";

  // In production, rely primarily on API key authentication
  // In development, allow localhost access for convenience
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isLocalhost =
    isDevelopment &&
    (clientIP === "127.0.0.1" ||
      clientIP === "::1" ||
      clientIP?.includes("127.0.0.1") ||
      clientIP?.includes("::1"));

  // Allow access if has valid API key OR internal request header OR (in development AND from localhost)
  if (hasValidKey || isInternalRequest || isLocalhost) {
    return next();
  }

  // Log the attempt for security monitoring
  console.warn(
    `Unauthorized access attempt to internal API from IP: ${clientIP}, User-Agent: ${req.headers["user-agent"]}`
  );

  // Deny access
  return res.status(403).json({
    error: "Forbidden: This endpoint is for internal use only",
  });
};
