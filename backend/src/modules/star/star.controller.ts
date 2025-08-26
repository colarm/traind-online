/**
 * Filename: star.controller.ts
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
import starService from "./star.service";

const starController = {
  // [AI-GENERATED: Claude, 2025-08-05]
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Extract pagination parameters from query string
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      // Enforce pagination limit for performance
      if (limit > 50) {
        return res.status(400).json({ error: "Limit cannot exceed 50" });
      }

      const result = await starService.getStarredTrainds({
        userId,
        cursor,
        limit,
      });

      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: "Failed to fetch starred trainds" });
    }
  },

  // [AI-GENERATED: Claude, 2025-08-13]
  async toggle(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { traindId } = req.params;

      const result = await starService.toggleStar({ userId, traindId });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to toggle star" });
    }
  },
};

export default starController;
