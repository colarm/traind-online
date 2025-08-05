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
      const stars = await starService.getStarredTrainds(userId);
      res.status(200).json(stars);
    } catch (err) {
      res.status(400).json({ error: "Failed to fetch starred trainds" });
    }
  },
};

export default starController;