import { Router } from "express";
import commentController from "./comment.controller";
import { authenticate } from "../../shared/middlewares/auth.middleware";

const { addComment, replyToComment, getComments } = commentController;

const router = Router();

router.post("/", authenticate, addComment);
router.post("/reply", authenticate, replyToComment);
router.get("/:traindId", getComments);

export default router;
