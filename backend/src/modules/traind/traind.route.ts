import { Router } from "express";
import traindController from "./traind.controller";
import {
  authenticate,
  optionalAuthenticate,
} from "../../shared/middlewares/auth.middleware";

const router = Router();

const {
  runAnalysis,
  getTraindById,
  setVisibility,
  deleteTraind,
  getParameterSetId,
  getMyTrainds,
} = traindController;

// Route to run analysis
router.post("/run", authenticate, runAnalysis);
// Route to get all trainds for the current user
router.get("/my", authenticate, getMyTrainds);
// Route to get Traind record by ID
router.get("/:traindId", optionalAuthenticate, getTraindById);
// Route to set visibility of a Traind record
router.patch("/:traindId/visibility", authenticate, setVisibility);
// Route to delete a Traind record
router.delete("/:traindId", authenticate, deleteTraind);
// Route to get parameter set ID by Traind ID
router.get("/:traindId/parameter-set", optionalAuthenticate, getParameterSetId);

export default router;
