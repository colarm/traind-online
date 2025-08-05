import { Request, Response } from "express";
import historyService from "./history.service";

const historyController = {
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
    
	async remove(req: Request, res: Response) {
		try {
			const userId = (req as any).user.id;
			const { traindId } = req.body;

			await historyService.removeHistory({ userId, traindId });
			res.status(204).send();
		} catch (err: any) {
			res.status(400).json({ error: err.message || "Failed to remove history" });
		}
	},

	async list(req: Request, res: Response) {
		try {
			const userId = (req as any).user.id;
			const histories = await historyService.getViewedTrainds(userId);
			res.status(200).json(histories);
		} catch (err) {
			res.status(400).json({ error: "Failed to fetch user histories" });
		}
	},
};

export default historyController;