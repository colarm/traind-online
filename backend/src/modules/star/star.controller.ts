import { Request, Response } from "express";
import starService from "./star.service";

const starController = {
  async add(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { traindId } = req.body;

      const star = await starService.addStar({ userId, traindId });
      res.status(201).json(star);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to add star" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { traindId } = req.body;

      await starService.removeStar({ userId, traindId });
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to unstar" });
    }
  },

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
};

export default starController;
