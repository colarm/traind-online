import httpClient from "./axios";
import { Traind } from "../types/traind";
import { adaptTraindResponse } from "./traind";

// Feed API response interfaces
export interface FeedResponse {
  success: boolean;
  data: {
    trainds: any[];
    total: number;
    recommendationReason?: string[];
  };
  meta: {
    isAuthenticated: boolean;
    userId?: string | null;
    generatedAt: string;
    weights?: {
      collaborative: number;
      content: number;
      trending: number;
    };
    subreddit?: string;
  };
}

export interface FeedParams {
  collaborative?: number; // 0-100
  content?: number; // 0-100
  trending?: number; // 0-100
}

// Get personalized feed
export async function getFeed(params?: FeedParams): Promise<FeedResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.collaborative !== undefined) {
      queryParams.append("collaborative", params.collaborative.toString());
    }
    if (params?.content !== undefined) {
      queryParams.append("content", params.content.toString());
    }
    if (params?.trending !== undefined) {
      queryParams.append("trending", params.trending.toString());
    }

    const endpoint = `/feed/trainds${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get feed"
    );
  }
}

// Get subreddit feed
export async function getSubredditFeed(
  subreddit: string
): Promise<FeedResponse> {
  try {
    const response = await httpClient.get(
      `/feed/subreddit/${encodeURIComponent(subreddit)}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get subreddit feed"
    );
  }
}

// Adapter function to convert feed response to frontend format
export function adaptFeedResponse(feedResponse: FeedResponse): {
  trainds: Traind[];
  meta: FeedResponse["meta"];
  total: number;
  recommendationReason?: string[];
} {
  const adaptedTrainds = feedResponse.data.trainds.map(adaptTraindResponse);

  return {
    trainds: adaptedTrainds,
    meta: feedResponse.meta,
    total: feedResponse.data.total,
    recommendationReason: feedResponse.data.recommendationReason,
  };
}
