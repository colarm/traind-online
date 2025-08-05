import { Router } from "express";
import historyController from "./history.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const { add, remove, list } = historyController;

const router = Router();

router.post("/add", authenticate, add);
router.post("/remove", authenticate, remove);
router.get("/list", authenticate, list);

export default router;