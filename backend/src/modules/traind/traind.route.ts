import { Router } from "express";
import traindController from "./traind.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();

const {
  runAnalysis,
  getTraindById,
  setVisibility,
  deleteTraind,
  getParameterSetId,
} = traindController;

// Route to run analysis
router.post("/run", authenticate, runAnalysis);
// Route to get Traind record by ID
router.get("/:traindId", authenticate, getTraindById);
// Route to set visibility of a Traind record
router.patch("/:traindId/visibility", authenticate, setVisibility);
// Route to delete a Traind record
router.delete("/:traindId", authenticate, deleteTraind);
// Route to get parameter set ID by Traind ID
router.get("/:traindId/parameter-set", authenticate, getParameterSetId);

export default router;
