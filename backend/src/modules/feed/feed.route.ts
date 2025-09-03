import { Router } from "express";
import feedController from "./feed.controller";
import { optionalAuthenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();
const { getFeed } = feedController;

router.get("/trainds", optionalAuthenticate, getFeed);

export default router;
