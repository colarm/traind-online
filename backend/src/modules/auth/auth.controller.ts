import { Request, Response } from "express";
import authService from "./auth.service";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res
      .cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "lax",
        maxAge: 3600000 * 24 * 7,
      })
      .json({ message: "Login success" });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

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

export const status = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(200)
        .json({ valid: false, message: "No token provided, unauthorized." });
    }

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
    const user = await authService.getUserById(userId);
    res.status(200).json({ valid: true, userId: user.id, email: user.email });
  } catch (err: any) {
    res
      .status(401)
      .json({ valid: false, message: err.message || "Unknown error" });
  }
};
