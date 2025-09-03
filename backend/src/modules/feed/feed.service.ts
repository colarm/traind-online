/**
 * Filename: feed.service.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-12
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-12
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { PrismaClient } from "@prisma/client";
import { FeedUserProfile, FeedResult, SimilarUser } from "./feed.types";

const prisma = new PrismaClient();

// === Algorithm Functions ===
// Behavior-based recommendation algorithms

// Calculate content-based recommendation score
const calculateContentBasedScore = (
  traind: any,
  userPrefs: FeedUserProfile
): number => {
  // Find user's preference for this traind's subreddit
  const subredditPref = userPrefs.favoriteSubreddits.find(
    (s) => s.subreddit === traind.subreddit
  );

  if (subredditPref) {
    const maxSubredditScore = Math.max(
      ...userPrefs.favoriteSubreddits.map((s) => s.score)
    );
    return maxSubredditScore > 0 ? subredditPref.score / maxSubredditScore : 0;
  }

  // No score for unknown subreddits, let other algorithms decide
  return 0;
};

// Calculate trending score based on popularity and recency
const calculateTrendingScore = (traind: any): number => {
  // Calculate popularity score from interactions
  const popularity =
    (traind._count?.stars || 0) * 3 +
    (traind._count?.comments || 0) * 2 +
    (traind._count?.history || 0) * 1;

  const popularityScore = Math.log(popularity + 1) / Math.log(100);

  // Calculate recency score (content loses relevance over time)
  const daysSinceCreation =
    (Date.now() - new Date(traind.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - daysSinceCreation / 30);

  // Combine popularity (70%) and recency (30%)
  const trendingScore = popularityScore * 0.7 + recencyScore * 0.3;

  return Math.min(trendingScore, 1);
};

// Calculate collaborative filtering score based on similar users
const calculateCollaborativeScore = async (
  traind: any,
  userId: string,
  userPrefs: FeedUserProfile
): Promise<number> => {
  // Find users with similar subreddit preferences
  const similarUsers = await findSimilarUsers(userId, userPrefs);

  if (similarUsers.length === 0) {
    return 0;
  }

  const similarUserIds = similarUsers.map((u) => u.id);

  // Get interactions from similar users for this specific traind
  const interactions = await prisma.traind.findUnique({
    where: { id: traind.id },
    include: {
      stars: {
        where: { userId: { in: similarUserIds } },
      },
      comments: {
        where: { userId: { in: similarUserIds } },
      },
      history: {
        where: { userId: { in: similarUserIds } },
      },
    },
  });

  if (!interactions) return 0;

  // Calculate weighted interaction score
  const starScore = interactions.stars.length * 3;
  const commentScore = interactions.comments.length * 2;
  const viewScore = interactions.history.length * 1;

  const totalInteractions = starScore + commentScore + viewScore;
  const maxPossibleScore = similarUserIds.length * 3;

  return maxPossibleScore > 0
    ? Math.min(totalInteractions / maxPossibleScore, 1)
    : 0;
};

// === Data Retrieval Functions ===
// Database query functions for recommendation system

// Common include configuration for traind queries
const getTraindInclude = (userId?: string) => ({
  user: {
    select: {
      id: true,
      email: true,
    },
  },
  _count: {
    select: {
      stars: true,
      comments: true,
      history: true,
    },
  },
  ...(userId && {
    stars: {
      where: { userId },
      select: { id: true },
    },
  }),
});

// Get candidate content for personalised recommendations
const getCandidateTrainds = async (userId: string): Promise<any[]> => {
  // Only consider content from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.traind.findMany({
    where: {
      isPublic: true,
      status: "completed", // Only include successfully completed trainds
      createdAt: { gte: thirtyDaysAgo },
      // Exclude content user has already interacted with
      NOT: {
        OR: [
          { userId }, // User's own content
          { history: { some: { userId } } }, // Already viewed
          { stars: { some: { userId } } }, // Already starred
        ],
      },
    },
    include: getTraindInclude(userId),
    orderBy: { createdAt: "desc" },
    take: 500, // Limit candidate pool for performance
  });
};

// Find users with similar subreddit preferences for collaborative filtering
const findSimilarUsers = async (
  userId: string,
  userPrefs: FeedUserProfile
): Promise<SimilarUser[]> => {
  const userSubreddits = userPrefs.favoriteSubreddits.map((s) => s.subreddit);

  return await prisma.user.findMany({
    where: {
      NOT: { id: userId },
      // Find users who have interacted with completed content in user's favourite subreddits
      OR: ["stars", "history", "comments"].map((relation) => ({
        [relation]: {
          some: {
            traind: {
              subreddit: { in: userSubreddits },
              status: "completed", // Only consider completed trainds
            },
          },
        },
      })),
    },
    select: { id: true },
    take: 10, // Limit to top 10 similar users
  });
};

// Analyse user behaviour patterns to build preference profile
const analyseFeedUserProfile = async (
  userId: string
): Promise<FeedUserProfile> => {
  // Fetch user interaction data in parallel for performance
  const [starredTrainds, viewHistory, userComments] = await Promise.all([
    prisma.star.findMany({
      where: {
        userId,
        traind: { status: "completed" }, // Only learn from completed trainds
      },
      include: { traind: { select: { subreddit: true, createdAt: true } } },
    }),
    prisma.history.findMany({
      where: {
        userId,
        traind: { status: "completed" }, // Only learn from completed trainds
      },
      include: { traind: { select: { subreddit: true, createdAt: true } } },
      orderBy: { viewedAt: "desc" },
      take: 100, // Consider recent 100 views only
    }),
    prisma.comment.findMany({
      where: {
        userId,
        traind: { status: "completed" }, // Only learn from completed trainds
      },
      include: { traind: { select: { subreddit: true } } },
    }),
  ]);

  // Calculate subreddit preferences with weighted scoring
  const subredditCounts = new Map<string, number>();
  [
    // Stars have highest weight (strong preference signal)
    ...starredTrainds.map((s) => ({ traind: s.traind, weight: 3 })),
    // Comments indicate moderate engagement
    ...userComments.map((c) => ({ traind: c.traind, weight: 2 })),
    // Views are weakest signal but still valuable
    ...viewHistory.map((h) => ({ traind: h.traind, weight: 1 })),
  ].forEach(({ traind, weight }) => {
    subredditCounts.set(
      traind.subreddit,
      (subredditCounts.get(traind.subreddit) || 0) + weight
    );
  });

  // Extract top 10 favourite subreddits
  const favoriteSubreddits = Array.from(subredditCounts.entries())
    .map(([subreddit, score]) => ({ subreddit, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Calculate user interaction patterns
  const totalViews = viewHistory.length;
  const interactionPatterns = {
    // Ratio of stars to views (selectivity indicator)
    viewToStarRatio: totalViews > 0 ? starredTrainds.length / totalViews : 0,
    // Comment engagement level
    commentEngagement: totalViews > 0 ? userComments.length / totalViews : 0,
  };

  return { favoriteSubreddits, interactionPatterns };
};

// === Utility Functions ===
// Process trainds with isStarred field and remove sensitive data
const processTrainds = (trainds: any[], userId?: string) =>
  trainds.map((traind) => ({
    ...traind,
    // Add isStarred flag for authenticated users
    ...(userId && { isStarred: traind.stars?.length > 0 }),
    // Remove stars array to prevent data leakage
    stars: undefined,
  }));

// === Public Interfaces ===
const feedService = {
  // Hybrid personalised feed using behaviour-based algorithms
  async getPersonalisedFeed(
    userId: string,
    collaborativeWeight: number = 0.5,
    contentWeight: number = 0.3,
    trendingWeight: number = 0.2
  ): Promise<FeedResult> {
    // Build user preference profile
    const userPrefs = await analyseFeedUserProfile(userId);
    // Get candidate content pool
    const candidateTrainds = await getCandidateTrainds(userId);

    // Score each candidate using hybrid algorithm
    const scoredTrainds = await Promise.all(
      candidateTrainds.map(async (traind) => {
        // Calculate scores from all three algorithms in parallel
        const [collaborativeScore, contentScore, trendingScore] =
          await Promise.all([
            calculateCollaborativeScore(traind, userId, userPrefs),
            Promise.resolve(calculateContentBasedScore(traind, userPrefs)),
            Promise.resolve(calculateTrendingScore(traind)),
          ]);

        // Combine scores with configurable weights
        const hybridScore =
          collaborativeScore * collaborativeWeight +
          contentScore * contentWeight +
          trendingScore * trendingWeight;

        return {
          ...traind,
          collaborativeScore,
          contentScore,
          trendingScore,
          hybridScore,
          isPersonalized: true,
        };
      })
    );

    // Sort by hybrid score and limit results
    const limitedTrainds = processTrainds(
      scoredTrainds.sort((a, b) => b.hybridScore - a.hybridScore).slice(0, 50),
      userId
    );

    return {
      trainds: limitedTrainds,
      total: scoredTrainds.length,
      recommendationReason: [
        `Hybrid algorithm: ${Math.round(
          collaborativeWeight * 100
        )}% collaborative + ${Math.round(
          contentWeight * 100
        )}% subreddit + ${Math.round(trendingWeight * 100)}% trending`,
        "Based on users with similar subreddit preferences",
        "Personalised ranking from your community activity patterns",
      ],
    };
  },

  // Basic trending feed for general audience
  async getTrendingFeed(userId?: string): Promise<FeedResult> {
    // Only consider content from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trainds = await prisma.traind.findMany({
      where: {
        isPublic: true,
        status: "completed", // Only include successfully completed trainds
        createdAt: { gte: thirtyDaysAgo },
      },
      include: getTraindInclude(userId),
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // Score using trending algorithm only
    const scoredTrainds = trainds
      .map((traind) => ({
        ...traind,
        trendingScore: calculateTrendingScore(traind),
        finalScore: calculateTrendingScore(traind),
        isPersonalized: false,
        recommendationSource: "trending",
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 50);

    return {
      trainds: processTrainds(scoredTrainds, userId),
      total: scoredTrainds.length,
    };
  },
};

export default feedService;
