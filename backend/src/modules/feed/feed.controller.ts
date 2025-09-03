/**
 * Filename: feed.controller.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-12
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-12
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { Request, Response } from "express";
import feedService from "./feed.service";

const feedController = {
  // [AI-GENERATED: Claude, 2025-08-12]
  async getFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // For guest users
      if (!userId) {
        const feed = await feedService.getTrendingFeed();

        res.json({
          success: true,
          data: feed,
          meta: {
            isAuthenticated: false,
            generatedAt: new Date().toISOString(),
          },
        });
        return;
      }

      // For authenticated users
      const collaborativeWeight =
        req.query.collaborative !== undefined
          ? parseInt(req.query.collaborative as string)
          : 40;
      const contentWeight =
        req.query.content !== undefined
          ? parseInt(req.query.content as string)
          : 40;
      const trendingWeight =
        req.query.trending !== undefined
          ? parseInt(req.query.trending as string)
          : 20;

      const totalWeight = collaborativeWeight + contentWeight + trendingWeight;
      if (totalWeight !== 100) {
        return res.status(400).json({
          success: false,
          error: "Total weight must be 100",
          message: `Current total weight is ${totalWeight}, please adjust the weight configuration.`,
        });
      }

      if (
        collaborativeWeight < 0 ||
        collaborativeWeight > 100 ||
        contentWeight < 0 ||
        contentWeight > 100 ||
        trendingWeight < 0 ||
        trendingWeight > 100
      ) {
        return res.status(400).json({
          success: false,
          error: "Weight values must be between 0 and 100",
        });
      }

      const feed = await feedService.getPersonalisedFeed(
        userId,
        collaborativeWeight / 100,
        contentWeight / 100,
        trendingWeight / 100
      );

      res.json({
        success: true,
        data: feed,
        meta: {
          weights: {
            collaborative: collaborativeWeight,
            content: contentWeight,
            trending: trendingWeight,
          },
          isAuthenticated: true,
          userId: userId,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error getting feed:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to fetch feed recommendations",
      });
    }
  },
};

export default feedController;
