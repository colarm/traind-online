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

// === Tool Functions ===
// [STUDENT-WRITTEN] Mock placeholder functions

// Extract content types (Mock)
const extractContentTypes = (trainds: any[]): string[] => {
  return [];
};

// Extract topic interests (Mock)
const extractTopicInterests = (
  trainds: any[]
): { topic: string; weight: number }[] => {
  return [];
};

// Extract training topics (Mock)
const extractTraindTopics = (traind: any): string[] => {
  return [];
};

// === Algorithm Functions ===
// [AI-GENERATED: Claude, 2025-08-12] Complex scoring algorithms

// Calculate search relevance score
const calculateSearchRelevanceScore = (traind: any, query: string): number => {
  const queryLower = query.toLowerCase();
  const title = (traind.title || "").toLowerCase();
  const subreddit = (traind.subreddit || "").toLowerCase();

  let score = 0;

  if (title === queryLower) {
    score += 1.0;
  } else if (title.includes(queryLower)) {
    const matchRatio = queryLower.length / title.length;
    score += 0.8 * matchRatio;
  }

  if (subreddit === queryLower) {
    score += 0.6;
  } else if (subreddit.includes(queryLower)) {
    const matchRatio = queryLower.length / subreddit.length;
    score += 0.4 * matchRatio;
  }

  if (title.startsWith(queryLower)) {
    score += 0.2;
  }

  return Math.min(score, 1);
};

// Calculate topic similarity
const calculateTopicSimilarity = (
  traind: any,
  topicInterests: { topic: string; weight: number }[]
): number => {
  const traindTopics = extractTraindTopics(traind);
  let maxSimilarity = 0;

  topicInterests.forEach((interest) => {
    traindTopics.forEach((traindTopic) => {
      if (
        traindTopic.toLowerCase().includes(interest.topic.toLowerCase()) ||
        interest.topic.toLowerCase().includes(traindTopic.toLowerCase())
      ) {
        maxSimilarity = Math.max(maxSimilarity, interest.weight);
      }
    });
  });

  return maxSimilarity;
};

// Calculate content-based recommendation score
const calculateContentBasedScore = (
  traind: any,
  userPrefs: FeedUserProfile
): number => {
  let score = 0;

  const subredditPref = userPrefs.favoriteSubreddits.find(
    (s) => s.subreddit === traind.subreddit
  );
  if (subredditPref) {
    const maxSubredditScore = Math.max(
      ...userPrefs.favoriteSubreddits.map((s) => s.score)
    );
    const subredditScore =
      maxSubredditScore > 0 ? subredditPref.score / maxSubredditScore : 0;
    score += subredditScore * 0.6;
  }

  const topicScore = calculateTopicSimilarity(traind, userPrefs.topicInterests);
  score += topicScore * 0.4;

  return Math.min(score, 1);
};

// Calculate trending score
const calculateTrendingScore = (traind: any): number => {
  const popularity =
    (traind._count?.stars || 0) * 3 +
    (traind._count?.comments || 0) * 2 +
    (traind._count?.history || 0) * 1;

  const popularityScore = Math.log(popularity + 1) / Math.log(100);

  const daysSinceCreation =
    (Date.now() - new Date(traind.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - daysSinceCreation / 30);

  const trendingScore = popularityScore * 0.7 + recencyScore * 0.3;

  return Math.min(trendingScore, 1);
};

// Calculate collaborative score
const calculateCollaborativeScore = async (
  traind: any,
  userId: string,
  userPrefs: FeedUserProfile
): Promise<number> => {
  const similarUsers = await findSimilarUsers(userId, userPrefs);

  if (similarUsers.length === 0) {
    return 0;
  }

  const similarUserIds = similarUsers.map((u) => u.id);

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
// [STUDENT-WRITTEN] Database query functions

// Get candidate content for recommendations
const getCandidateTrainds = async (userId: string): Promise<any[]> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.traind.findMany({
    where: {
      isPublic: true,
      createdAt: {
        gte: thirtyDaysAgo,
      },
      NOT: {
        OR: [
          { userId },
          { history: { some: { userId } } },
          { stars: { some: { userId } } },
        ],
      },
    },
    include: {
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
      stars: {
        where: { userId },
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });
};

// Find similar users
const findSimilarUsers = async (
  userId: string,
  userPrefs: FeedUserProfile
): Promise<SimilarUser[]> => {
  const userSubreddits = new Set(
    userPrefs.favoriteSubreddits.map((s) => s.subreddit)
  );

  const potentialSimilarUsers = await prisma.user.findMany({
    where: {
      NOT: { id: userId },
      OR: [
        {
          stars: {
            some: {
              traind: {
                subreddit: {
                  in: Array.from(userSubreddits),
                },
              },
            },
          },
        },
        {
          history: {
            some: {
              traind: {
                subreddit: {
                  in: Array.from(userSubreddits),
                },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
    take: 10,
  });

  return potentialSimilarUsers;
};

// Analyze user preferences
const analyzeFeedUserProfile = async (
  userId: string
): Promise<FeedUserProfile> => {
  const starredTrainds = await prisma.star.findMany({
    where: { userId },
    include: {
      traind: {
        select: {
          subreddit: true,
          createdAt: true,
          result: true,
        },
      },
    },
  });

  const viewHistory = await prisma.history.findMany({
    where: { userId },
    include: {
      traind: {
        select: {
          subreddit: true,
          createdAt: true,
          result: true,
        },
      },
    },
    orderBy: {
      viewedAt: "desc",
    },
    take: 100,
  });

  const userComments = await prisma.comment.findMany({
    where: { userId },
    include: {
      traind: {
        select: {
          subreddit: true,
          result: true,
        },
      },
    },
  });

  const subredditCounts = new Map<string, number>();
  const allTrainds = [
    ...starredTrainds.map((s) => ({ traind: s.traind, weight: 3 })),
    ...viewHistory.map((h) => ({ traind: h.traind, weight: 1 })),
    ...userComments.map((c) => ({ traind: c.traind, weight: 2 })),
  ];

  allTrainds.forEach(({ traind, weight }) => {
    const current = subredditCounts.get(traind.subreddit) || 0;
    subredditCounts.set(traind.subreddit, current + weight);
  });

  const favoriteSubreddits = Array.from(subredditCounts.entries())
    .map(([subreddit, score]) => ({ subreddit, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const hourCounts = new Array(24).fill(0);
  viewHistory.forEach((view) => {
    const hour = new Date(view.viewedAt).getHours();
    hourCounts[hour]++;
  });

  const preferredTimeRanges = hourCounts
    .map((frequency, hour) => ({ hour, frequency }))
    .filter((range) => range.frequency > 0)
    .sort((a, b) => b.frequency - a.frequency);

  const totalViews = viewHistory.length;
  const totalStars = starredTrainds.length;
  const totalComments = userComments.length;

  const interactionPatterns = {
    viewToStarRatio: totalViews > 0 ? totalStars / totalViews : 0,
    commentEngagement: totalViews > 0 ? totalComments / totalViews : 0,
    preferredContentTypes: extractContentTypes(allTrainds.map((t) => t.traind)),
  };

  const topicInterests = extractTopicInterests(allTrainds.map((t) => t.traind));

  return {
    favoriteSubreddits,
    preferredTimeRanges,
    interactionPatterns,
    topicInterests,
  };
};

// === Public Interfaces ===
// [STUDENT-WRITTEN] Service interface structure with AI-assisted algorithm implementation
const feedService = {
  // [AI-GENERATED: Claude, 2025-08-12]
  async getPersonalizedFeed(
    userId: string,
    collaborativeWeight: number = 0.4,
    contentWeight: number = 0.4,
    trendingWeight: number = 0.2
  ): Promise<FeedResult> {
    const userPrefs = await analyzeFeedUserProfile(userId);
    const candidateTrainds = await getCandidateTrainds(userId);

    const scoredTrainds = await Promise.all(
      candidateTrainds.map(async (traind) => {
        const collaborativeScore = await calculateCollaborativeScore(
          traind,
          userId,
          userPrefs
        );
        const contentScore = calculateContentBasedScore(traind, userPrefs);
        const trendingScore = calculateTrendingScore(traind);

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
          isStarred: (traind as any).stars?.length > 0,
          stars: undefined, // Remove stars array from response
        };
      })
    );

    scoredTrainds.sort((a, b) => b.hybridScore - a.hybridScore);

    const limitedTrainds = scoredTrainds.slice(0, 50);

    const recommendationReasons = [
      `Based on hybrid recommendation algorithm: ${Math.round(
        collaborativeWeight * 100
      )}% collaborative filtering + ${Math.round(
        contentWeight * 100
      )}% content-based + ${Math.round(trendingWeight * 100)}% trending`,
      "Each item is scored by three algorithms in combination",
      "Personalized ranking based on your historical behavior and preferences",
    ];

    return {
      trainds: limitedTrainds,
      total: scoredTrainds.length,
      recommendationReason: recommendationReasons,
    };
  },

  // [STUDENT-WRITTEN] Basic trending feed with AI-assisted scoring
  async getTrendingFeed(userId?: string): Promise<FeedResult> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trainds = await prisma.traind.findMany({
      where: {
        isPublic: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    const scoredTrainds = trainds.map((traind) => {
      const trendingScore = calculateTrendingScore(traind);

      return {
        ...traind,
        trendingScore,
        finalScore: trendingScore,
        isPersonalized: false,
        recommendationSource: "trending",
        ...(userId && {
          isStarred: (traind as any).stars?.length > 0,
        }),
        stars: undefined, // Remove stars array from response
      };
    });

    scoredTrainds.sort((a, b) => b.finalScore - a.finalScore);

    const limitedTrainds = scoredTrainds.slice(0, 50);

    return {
      trainds: limitedTrainds,
      total: scoredTrainds.length,
    };
  },

  // [STUDENT-WRITTEN] Simple subreddit filtering
  async getSubredditFeed(
    subreddit: string,
    userId?: string
  ): Promise<FeedResult> {
    const trainds = await prisma.traind.findMany({
      where: {
        isPublic: true,
        subreddit: {
          equals: subreddit,
          mode: "insensitive",
        },
      },
      include: {
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Add isStarred field if user is provided
    const traindsWithStarStatus = trainds.map((traind) => ({
      ...traind,
      ...(userId && {
        isStarred: (traind as any).stars?.length > 0,
      }),
      stars: undefined, // Remove stars array from response
    }));

    const total = traindsWithStarStatus.length;

    return { trainds: traindsWithStarStatus, total };
  },

  // [AI-GENERATED: Claude, 2025-08-12] Personalized search with complex scoring
  async searchWithPersonalization(
    query: string,
    userId?: string
  ): Promise<FeedResult> {
    const trainds = await prisma.traind.findMany({
      where: {
        isPublic: true,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            subreddit: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
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
      },
    });

    if (userId) {
      const userPrefs = await analyzeFeedUserProfile(userId);

      const scoredTrainds = await Promise.all(
        trainds.map(async (traind) => {
          const relevanceScore = calculateSearchRelevanceScore(traind, query);

          const collaborativeScore = await calculateCollaborativeScore(
            traind,
            userId,
            userPrefs
          );
          const contentScore = calculateContentBasedScore(traind, userPrefs);
          const trendingScore = calculateTrendingScore(traind);

          const finalScore =
            relevanceScore * 0.5 +
            collaborativeScore * 0.2 +
            contentScore * 0.2 +
            trendingScore * 0.1;

          return {
            ...traind,
            searchRelevanceScore: relevanceScore,
            collaborativeScore,
            contentScore,
            trendingScore,
            finalScore,
            isPersonalized: true,
            isStarred: (traind as any).stars?.length > 0,
            stars: undefined, // Remove stars array from response
          };
        })
      );

      scoredTrainds.sort((a, b) => b.finalScore - a.finalScore);

      const limitedTrainds = scoredTrainds.slice(0, 50);

      return {
        trainds: limitedTrainds,
        total: scoredTrainds.length,
      };
    } else {
      const scoredTrainds = trainds.map((traind) => {
        const relevanceScore = calculateSearchRelevanceScore(traind, query);
        const trendingScore = calculateTrendingScore(traind);

        const finalScore = relevanceScore * 0.7 + trendingScore * 0.3;

        return {
          ...traind,
          searchRelevanceScore: relevanceScore,
          trendingScore,
          finalScore,
          isPersonalized: false,
          stars: undefined, // Remove stars array from response
        };
      });

      scoredTrainds.sort((a, b) => b.finalScore - a.finalScore);

      const limitedTrainds = scoredTrainds.slice(0, 50);

      return {
        trainds: limitedTrainds,
        total: scoredTrainds.length,
      };
    }
  },
};

export default feedService;
