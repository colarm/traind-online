import { Router } from "express";
import parameterSetController from "./parameterset.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();

const {
  save,
  load,
  copyFromTraind,
} = parameterSetController;

// Route to save parameter set
router.post("/save", authenticate, save);
// Route to load parameter set by ID
router.get("/:id", authenticate, load);
// Route to copy parameter set from Traind
router.post("/copy", authenticate, copyFromTraind);

export default router;