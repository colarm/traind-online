import { Router } from "express";
import starController from "./star.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const { list, toggle } = starController;

const router = Router();

router.get("/list", authenticate, list);
router.post("/toggle/:traindId", authenticate, toggle);

export default router;
