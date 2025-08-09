import { Router } from "express";
import { register, login, logout, status } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/status", status);

export default router;
