import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import traindRoutes from "./modules/traind/traind.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/traind", traindRoutes);

export default router;
