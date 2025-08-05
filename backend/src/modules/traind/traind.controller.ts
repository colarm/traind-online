import { Request, Response } from "express";
import traindService from "./traind.service";

const traindController = {
  async runAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { redditId, parameterSetId } = req.body;

      // Validate input
      if (!redditId || !parameterSetId) {
        return res
          .status(400)
          .json({ error: "Reddit ID and Parameter Set ID are required" });
      }

      // Check if user is authenticated
      if (!(req as any).user || !(req as any).user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Get user ID from request (assumed to be set in middleware)
      const userId = (req as any).user.id;

      // Run analysis
      const traindId = await traindService.runAnalysis({
        userId,
        redditId,
        parameterSetId,
      });

      return res.status(201).json({ traindId });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get Traind record by ID
  async getTraindById(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;

      // Get Traind record by ID
      const traind = await traindService.getTraindById(traindId);

      if (!traind) {
        return res.status(404).json({ error: "Traind record not found" });
      }

      return res.status(200).json(traind);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Export traind results implements after the analysis is complete

  // Set visibility of a Traind record
  async setVisibility(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;
      const { isPublic } = req.body;

      // Update visibility of Traind record
      const updatedTraind = await traindService.setVisibility(
        traindId,
        isPublic
      );

      // If the Traind record is not found, return null
      if (!updatedTraind) {
        return res.status(404).json({ error: "Traind record not found" });
      }

      return res.status(200).json({ updatedTraind });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete a Traind record
  async deleteTraind(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;

      // Delete Traind record
      await traindService.deleteTraind(traindId);

      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get parameter set ID by Traind ID
  async getParameterSetId(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;

      // Get parameter set ID
      const parameterSetId = await traindService.getParameterSetId(traindId);

      if (!parameterSetId) {
        return res
          .status(404)
          .json({ error: "Parameter Set ID not found for this Traind" });
      }

      return res.status(200).json({ parameterSetId });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default traindController;
