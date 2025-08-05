import { Router } from "express";
import { starController } from "./star.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const { add, remove, list } = starController;

const router = Router();

router.post("/add", authenticate, add);
router.post("/remove", authenticate, remove);
router.get("/list", authenticate, list);

export default router;
