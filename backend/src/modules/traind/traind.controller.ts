/**
 * Traind analysis controller
 * Handles HTTP requests for Traind analysis operations, queue management, and result processing
 *
 * Filename: traind.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-04
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import traindService from "./traind.service";

const traindController = {
  /**
   * Start a new Traind analysis
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async runAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { redditId, parameterSetId } = req.body;

      // Validate required input parameters
      if (!redditId || !parameterSetId) {
        return res
          .status(400)
          .json({ error: "Reddit ID and Parameter Set ID are required" });
      }

      // Extract user ID from authenticated request
      const userId = (req as any).user.id;

      // Initiate analysis process
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

  /**
   * Retrieve a specific Traind record by ID
   */
  async getTraindById(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;
      const userId = (req as any).user?.id; // Optional for star status

      const traind = await traindService.getTraindById(traindId, userId);

      if (!traind) {
        return res.status(404).json({ error: "Traind record not found" });
      }

      return res.status(200).json(traind);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update visibility settings for a Traind record
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async setVisibility(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;
      const { isPublic } = req.body;

      const updatedTraind = await traindService.setVisibility(
        traindId,
        isPublic
      );

      if (!updatedTraind) {
        return res.status(404).json({ error: "Traind record not found" });
      }

      return res.status(200).json({ updatedTraind });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Delete a Traind record (with user authorization)
   */
  async deleteTraind(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;
      const userId = (req as any).user.id;

      await traindService.deleteTraind(traindId, userId);

      return res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting Traind:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get parameter set ID associated with a Traind
   */
  async getParameterSetId(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;

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

  /**
   * Get paginated list of user's Traind records
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async getMyTrainds(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;

      // Parse pagination parameters
      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      // Enforce pagination limits
      if (limit > 50) {
        return res.status(400).json({ error: "Limit cannot exceed 50" });
      }

      const result = await traindService.getMyTrainds({
        userId,
        cursor,
        limit,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get pending/processing Traind records for user
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async getPendingTrainds(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;

      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      if (limit > 50) {
        return res.status(400).json({ error: "Limit cannot exceed 50" });
      }

      const result = await traindService.getPendingTrainds({
        userId,
        limit,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error getting pending trainds:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get queue position for a specific Traind in ML processing queue
   */
  async getQueuePosition(req: Request, res: Response): Promise<Response> {
    try {
      const { traindId } = req.params;

      const queuePosition = await traindService.getQueuePosition(traindId);

      if (!queuePosition) {
        return res.status(404).json({
          error: "Traind not found or not in queue",
        });
      }

      return res.status(200).json(queuePosition);
    } catch (error: any) {
      console.error("Error getting queue position:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Internal API: Update Traind with ML analysis results
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async updateTraindResult(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId, result, status = "completed", title } = req.body;

      // Validate required fields
      if (!taskId || !result) {
        return res.status(400).json({
          error: "Task ID and result are required",
        });
      }

      const success = await traindService.updateTraindResult(
        taskId,
        result,
        status,
        title
      );

      if (!success) {
        return res.status(404).json({
          error: "Traind record not found or already processed",
        });
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error updating traind result:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  /**
   * Internal API: Mark Traind as failed with error message
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async updateTraindFailed(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId, errorMessage } = req.body;

      // Validate required fields
      if (!taskId || !errorMessage) {
        return res.status(400).json({
          error: "Task ID and error message are required",
        });
      }

      const success = await traindService.updateTraindFailed(
        taskId,
        errorMessage
      );

      if (!success) {
        return res.status(404).json({
          error: "Traind record not found or already processed",
        });
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error updating traind to failed:", error);
      return res.status(500).json({ error: error.message });
    }
  },
};

export default traindController;
