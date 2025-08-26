/**
 * Filename: history.controller.ts
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
import historyService from "./history.service";

const historyController = {
  // [AI-GENERATED: Claude, 2025-08-05]
  async add(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { traindId } = req.body;

      const history = await historyService.addHistory({ userId, traindId });
      res.status(201).json(history);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add history" });
    }
  },

  // [AI-GENERATED: Claude, 2025-08-05]
  async remove(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { traindId } = req.body;

      await historyService.removeHistory({ userId, traindId });
      res.status(204).send();
    } catch (err: any) {
      res
        .status(400)
        .json({ error: err.message || "Failed to remove history" });
    }
  },

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

      const result = await historyService.getViewedTrainds({
        userId,
        cursor,
        limit,
      });

      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: "Failed to fetch user histories" });
    }
  },
};

export default historyController;
