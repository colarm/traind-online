import { Request, Response } from "express";
import starService from "./star.service";

const starController = {
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Get pagination parameters from query
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      // Validate limit
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
