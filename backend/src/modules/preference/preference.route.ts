import { Router } from "express";
import preferenceController from "./preference.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();

const {
    updatePreference,
    getPreference
} = preferenceController;

// Route to update user preferences
router.put("/", authenticate, updatePreference);
// Route to get user preferences
router.get("/", authenticate, getPreference);

export default router;