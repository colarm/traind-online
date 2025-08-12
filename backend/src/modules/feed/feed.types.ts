export interface FeedUserProfile {
  favoriteSubreddits: { subreddit: string; score: number }[];
  preferredTimeRanges: { hour: number; frequency: number }[];
  interactionPatterns: {
    viewToStarRatio: number;
    commentEngagement: number;
    preferredContentTypes: string[];
  };
  topicInterests: { topic: string; weight: number }[];
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
