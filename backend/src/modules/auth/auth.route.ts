/**
 * Authentication routes
 * Handles user registration, login, logout, and status checking
 */

import { Router } from "express";
import {
  register,
  login,
  logout,
  status,
  requestPasswordReset,
  resetPassword,
} from "./auth.controller";

const router = Router();

// User registration endpoint
router.post("/register", register);

// User login endpoint
router.post("/login", login);

// User logout endpoint
router.post("/logout", logout);

// Check authentication status
router.get("/status", status);

// Password reset endpoints
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
