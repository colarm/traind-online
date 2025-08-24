import { Request, Response } from "express";
import preferenceService from "./preference.service";
import { UpdatePreferenceInput } from "./preference.types";

const preferenceController = {
  async updatePreference(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { theme, makeTraindsPublicAsDefault, emailNotifications } =
        req.body;

      // Build update object with only provided fields
      const updateData: UpdatePreferenceInput = {};
      if (theme !== undefined) updateData.theme = theme;
      if (makeTraindsPublicAsDefault !== undefined)
        updateData.makeTraindsPublicAsDefault = makeTraindsPublicAsDefault;
      if (emailNotifications !== undefined)
        updateData.emailNotifications = emailNotifications;

      // Check if at least one field is provided
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: "At least one preference field must be provided",
        });
      }

      const updated = await preferenceService.update(updateData, userId);

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
