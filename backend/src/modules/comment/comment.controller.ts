import { Request, Response } from "express";
import commentService from "./comment.service";

const commentController = {
  async addComment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { traindId, text } = req.body;

    if (!traindId || !text) {
      return res.status(400).json({ error: "traindId and text are required" });
    }

    try {
      const comment = await commentService.add({ userId, traindId, text });
      return res.status(201).json(comment);
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to add comment" });
    }
  },

  async replyToComment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { traindId, parentId, text } = req.body;

    if (!traindId || !parentId || !text) {
      return res
        .status(400)
        .json({ error: "traindId, parentId and text are required" });
    }

    try {
      const comment = await commentService.reply({
        userId,
        traindId,
        parentId,
        text,
      });
      return res.status(201).json(comment);
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to reply to comment" });
    }
  },

  async getComments(req: Request, res: Response) {
    const { traindId } = req.params;
    const { parentId, cursorId, limit } = req.query;

    try {
      const result = await commentService.getByTraind({
        traindId,
        parentId: parentId as string,
        cursorId: cursorId as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      return res.status(200).json(result);
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to get comments" });
    }
  },
};

export default commentController;
