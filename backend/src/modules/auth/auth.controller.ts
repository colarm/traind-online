import { Request, Response } from "express";
import authService from "./auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res
      .cookie("token", result.token, {
        httpOnly: true,
        secure: false, // dev 环境设为 false，生产要 true
        sameSite: "lax",
        maxAge: 3600000 * 24 * 7, // 7 days
      })
      .json({ message: "Login success" });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.status(200).json({ message: "Logout handled on client side." });
};
