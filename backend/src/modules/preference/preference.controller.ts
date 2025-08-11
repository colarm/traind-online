import { Request, Response } from "express";
import preferenceService from "./preference.service";
import { UpdatePreferenceInput } from "./preference.types";

const preferenceController = {
  async updatePreference(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { theme, language } = req.body;

      if (theme === undefined || language === undefined) {
        return res
          .status(400)
          .json({ error: "Missing theme or language data" });
      }

      const updated = await preferenceService.update(
        { theme, language } as UpdatePreferenceInput,
        userId
      );

      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  },

  async getPreference(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const pref = await preferenceService.get(userId);
      res.json(pref);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default preferenceController;
