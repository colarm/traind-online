import { Request, Response } from "express";
import feedService from "./feed.service";

const feedController = {
  // Get feed
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
        parseInt(req.query.collaborative as string) || 40;
      const contentWeight = parseInt(req.query.content as string) || 40;
      const trendingWeight = parseInt(req.query.trending as string) || 20;

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

      const feed = await feedService.getPersonalizedFeed(
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

  // Get subreddit feed
  async getSubredditFeed(req: Request, res: Response) {
    try {
      const { subreddit } = req.params;

      if (
        !subreddit ||
        typeof subreddit !== "string" ||
        subreddit.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid subreddit parameter",
        });
      }

      const feed = await feedService.getSubredditFeed(subreddit.trim());

      res.json({
        success: true,
        data: feed,
        meta: {
          subreddit: subreddit.trim(),
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error getting subreddit feed:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: `Failed to fetch content for subreddit: ${req.params.subreddit}`,
      });
    }
  },

  // Get personalized search results
  async searchWithPersonalization(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const query = req.query.q as string;

      if (!query || typeof query !== "string" || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Search query is required and cannot be empty",
        });
      }

      if (query.trim().length > 200) {
        return res.status(400).json({
          success: false,
          error: "Search query is too long (maximum 200 characters)",
        });
      }

      const results = await feedService.searchWithPersonalization(
        query.trim(),
        userId
      );

      res.json({
        success: true,
        data: results,
        meta: {
          query: query.trim(),
          isPersonalized: !!userId,
          userId: userId || null,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error searching with personalization:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to perform search",
      });
    }
  },
};

export default feedController;
