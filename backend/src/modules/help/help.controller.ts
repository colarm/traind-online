/**
 * Filename: help.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-06
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-06
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import helpService from "./help.service";

const helpController = {
  // [AI-GENERATED: Claude, 2025-08-06]
  async listTitles(req: Request, res: Response) {
    const titles = await helpService.listTitles();
    res.status(200).json(titles);
  },

  // [AI-GENERATED: Claude, 2025-08-06]
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const help = await helpService.getById(id);

      // Validate that help content exists and is not empty
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
