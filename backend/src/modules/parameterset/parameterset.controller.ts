/**
 * Parameter set controller
 * Handles HTTP requests for parameter set management operations
 *
 * Filename: parameterset.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-05
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-11
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import { parameterSetService } from "./parameterset.service";
import {
  SaveParameterSetInput,
  LoadParameterSetInput,
  CopyParameterInput,
} from "./parameterset.types";

const parameterSetController = {
  /**
   * Save a new parameter set configuration
   */
  async save(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, config } = req.body;

      const saved = await parameterSetService.saveConfig({
        userId,
        name,
        config,
      });
      return res.status(201).json(saved);
    } catch (err: any) {
      console.error("Save error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Load an existing parameter set by ID
   */
  async load(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paramSet = await parameterSetService.loadConfig({ id });
      return res.json(paramSet);
    } catch (err: any) {
      console.error("Load error:", err);
      return res.status(404).json({ error: err.message });
    }
  },

  /**
   * Copy parameter set from an existing Traind analysis
   */
  async copyFromTraind(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { traindId, name } = req.body;

      const copied = await parameterSetService.copyFromTraind(
        { traindId, name } as CopyParameterInput,
        userId
      );
      return res.status(201).json(copied);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get paginated list of user's parameter sets
   */
  // [AI-GENERATED: Claude, 2025-08-11]
  async getMyParameterSets(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // Parse pagination parameters
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      // Enforce pagination limits
      if (limit > 50) {
        return res.status(400).json({ error: "Limit cannot exceed 50" });
      }

      const result = await parameterSetService.getMyParameterSets({
        userId,
        cursor,
        limit,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Get my parameter sets error:", error);
      return res.status(500).json({ error: error.message });
    }
  },
};

export default parameterSetController;
