import { Request, Response } from "express";
import helpService from "./help.service";

const helpController = {
  async listTitles(req: Request, res: Response) {
    const titles = await helpService.listTitles();
    res.status(200).json(titles);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const help = await helpService.getById(id);
      if (!help.content) {
        return res.status(404).json({ error: "Help content is empty" });
      }
      res.status(200).json(help);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default helpController;