import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import traindRoutes from "./modules/traind/traind.route";
import parameterSetRoutes from "./modules/parameterset/parameterset.route";
import starRoutes from "./modules/star/star.route";
import historyRoutes from "./modules/history/history.route";
import commentRoutes from "./modules/comment/comment.route";
import preferenceRoute from "./modules/preference/preference.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/traind", traindRoutes);
router.use("/parameterset", parameterSetRoutes);
router.use("/star", starRoutes);
router.use("/history", historyRoutes);
router.use("/comment", commentRoutes);
router.use("/preference", preferenceRoute);

export default router;
