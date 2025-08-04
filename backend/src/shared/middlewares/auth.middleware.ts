import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  userId: string;
  // Add other fields if needed, e.g. email, role
}

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
