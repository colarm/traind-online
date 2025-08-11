import httpClient from "./axios";
import { Traind } from "../types/traind";

// Backend actual response format for trainds
export interface MyTraindsResponse {
  trainds: any[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
}

// Enhanced types for the frontend
export interface TraindWithPagination extends Traind {
  _count?: {
    stars: number;
    comments: number;
    views?: number;
  };
}

// Adapter function to convert backend response to frontend format
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
    _count: {
      stars: backendTraind.starCount || backendTraind._count?.stars || 0,
      comments:
        backendTraind.commentCount || backendTraind._count?.comments || 0,
      views: backendTraind.viewCount || backendTraind._count?.views || 0,
    },
  };
}

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

export async function getTraindById(traindId: string) {
  try {
    const response = await httpClient.get(`/traind/${traindId}`);
    return response.data;
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Get traind failed" };
  }
}

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

export async function deleteTraind(traindId: string) {
  try {
    await httpClient.delete(`/traind/${traindId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error?.response?.data?.message || "Delete traind failed" };
  }
}

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

// Get user's own trainds with pagination
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
