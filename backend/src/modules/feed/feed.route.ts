import { Router } from "express";
import feedController from "./feed.controller";

const router = Router();
const {
    getFeed,
    getSubredditFeed,
    searchWithPersonalization
} = feedController;

router.get("/trainds", getFeed);
router.get("/subreddit/:subreddit", getSubredditFeed);
router.get("/search", searchWithPersonalization);

export default router;
