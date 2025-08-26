/**
 * Traind API Client
 * Handles API calls for Traind analysis operations and data transformation
 *
 * Filename: traind.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-10
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-10
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import httpClient from "./axios";
import { Traind } from "../types/traind";

/**
 * Backend response format for paginated Traind listings
 */
export interface MyTraindsResponse {
  trainds: any[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
}

/**
 * Enhanced Traind type with additional count metadata
 */
export interface TraindWithPagination extends Traind {
  _count?: {
    stars: number;
    comments: number;
    views?: number;
  };
}

/**
 * Adapter function to normalize backend response to frontend format
 * Handles field name differences and provides default values
 */
// [AI-GENERATED: Claude, 2025-08-10]
export function adaptTraindResponse(backendTraind: any): TraindWithPagination {
  return {
    id: backendTraind.id,
    postId: backendTraind.postId || backendTraind.redditId, // Handle different field names
    subreddit: backendTraind.subreddit || "unknown",
    title: backendTraind.title || "Untitled Analysis",
    result: backendTraind.result || {},
    parameterSetId: backendTraind.parameterSetId,
    isPublic: backendTraind.isPublic || false,
    createdAt: backendTraind.createdAt,
    userId: backendTraind.userId,
    user: backendTraind.user,
    isStarred: backendTraind.isStarred || false,
    _count: {
      stars: backendTraind.starCount || backendTraind._count?.stars || 0,
      comments:
        backendTraind.commentCount || backendTraind._count?.comments || 0,
      views: backendTraind.viewCount || backendTraind._count?.views || 0,
    },
  };
}

/**
 * Start a new Reddit analysis task
 */
export async function runAnalysis(redditId: string, parameterSetId: string) {
  try {
    const response = await httpClient.post("/traind/run", {
      redditId,
      parameterSetId,
    });
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Run analysis failed" };
  }
}

/**
 * Retrieve a specific Traind by ID
 */
export async function getTraindById(traindId: string) {
  try {
    const response = await httpClient.get(`/traind/${traindId}`);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Get traind failed" };
  }
}

/**
 * Update the visibility setting of a Traind
 */
export async function setTraindVisibility(traindId: string, isPublic: boolean) {
  try {
    const response = await httpClient.patch(`/traind/${traindId}/visibility`, {
      isPublic,
    });
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Set visibility failed" };
  }
}

/**
 * Delete a Traind record
 */
export async function deleteTraind(traindId: string) {
  try {
    await httpClient.delete(`/traind/${traindId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Delete traind failed" };
  }
}

/**
 * Get the parameter set ID associated with a Traind
 */
export async function getParameterSetId(traindId: string) {
  try {
    const response = await httpClient.get(`/traind/${traindId}/parameter-set`);
    return response.data;
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Get parameter set failed",
    };
  }
}

/**
 * Get paginated list of user's Traind records
 */
// [AI-GENERATED: Claude, 2025-08-10]
export async function getMyTrainds(params?: {
  limit?: number;
  cursor?: string;
}): Promise<MyTraindsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append("cursor", params.cursor);
    }

    const endpoint = `/traind/my${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get my trainds"
    );
  }
}

/**
 * Export Traind analysis results in specified format
 */
export async function exportResult(traindId: string, format: string = "json") {
  try {
    const response = await httpClient.get(`/traind/${traindId}/export`, {
      params: { format },
    });
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Export result failed" };
  }
}
