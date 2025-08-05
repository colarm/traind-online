import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import traindRoutes from "./modules/traind/traind.route";
import parameterSetRoutes from "./modules/parameterset/parameterset.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/traind", traindRoutes);
router.use("/parameterset", parameterSetRoutes);

export default router;
