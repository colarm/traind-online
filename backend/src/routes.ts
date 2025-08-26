/**
 * Main API routes configuration
 * Aggregates all module routes under their respective endpoints
 */

import { Router } from "express";
import authRoutes from "./modules/auth/auth.route";
import traindRoutes from "./modules/traind/traind.route";
import parameterSetRoutes from "./modules/parameterset/parameterset.route";
import starRoutes from "./modules/star/star.route";
import historyRoutes from "./modules/history/history.route";
import commentRoutes from "./modules/comment/comment.route";
import preferenceRoutes from "./modules/preference/preference.route";
import helpRoutes from "./modules/help/help.route";
import feedRoutes from "./modules/feed/feed.route";

const router = Router();

// Authentication and user management
router.use("/auth", authRoutes);

// Core business logic routes
router.use("/traind", traindRoutes);
router.use("/parameterset", parameterSetRoutes);
router.use("/star", starRoutes);
router.use("/history", historyRoutes);
router.use("/comment", commentRoutes);

// User preferences and help
router.use("/preference", preferenceRoutes);
router.use("/help", helpRoutes);
router.use("/feed", feedRoutes);

export default router;
