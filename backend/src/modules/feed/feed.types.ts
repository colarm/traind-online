export interface FeedUserProfile {
  favoriteSubreddits: { subreddit: string; score: number }[];
  interactionPatterns: {
    viewToStarRatio: number;
    commentEngagement: number;
  };
}

export interface FeedResult {
  trainds: any[];
  total: number;
  recommendationReason?: string[];
}

export interface SimilarUser {
  id: string;
  similarity?: number;
}
