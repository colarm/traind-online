import { Router } from "express";
import feedController from "./feed.controller";
import { optionalAuthenticate } from "../../shared/middlewares/auth.middleware";

const router = Router();
const { getFeed, getSubredditFeed, searchWithPersonalization } = feedController;

router.get("/trainds", optionalAuthenticate, getFeed);
router.get("/subreddit/:subreddit", optionalAuthenticate, getSubredditFeed);
router.get("/search", optionalAuthenticate, searchWithPersonalization);

export default router;
