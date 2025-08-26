/**
 * Filename: comment.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-05
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-05
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import commentService from "./comment.service";

const commentController = {
  // [AI-GENERATED: Claude, 2025-08-05]
  async addComment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { traindId, text } = req.body;

    // Validate required parameters
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

  // [AI-GENERATED: Claude, 2025-08-05]
  async replyToComment(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    const { traindId, parentId, text } = req.body;

    // Validate required parameters for reply
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

  // [AI-GENERATED: Claude, 2025-08-05]
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
