import { Router } from "express";
import parameterSetController from "./parameterset.controller";
import { authenticate, optionalAuthenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();

const { save, load, copyFromTraind, getMyParameterSets } =
  parameterSetController;

// Route to save parameter set
router.post("/save", authenticate, save);
// Route to get all parameter sets for the current user
router.get("/my", authenticate, getMyParameterSets);
// Route to load parameter set by ID
router.get("/:id", optionalAuthenticate, load);
// Route to copy parameter set from Traind
router.post("/copy", authenticate, copyFromTraind);

export default router;
