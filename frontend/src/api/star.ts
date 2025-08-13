import httpClient from "./axios";
import { TraindWithPagination } from "./traind";

export interface StarItem {
  id: string;
  userId: string;
  traindId: string;
  createdAt: string;
  traind?: TraindWithPagination;
}

export interface StarListResponse {
  stars: StarItem[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string | null;
}

// Get user's starred trainds
export async function getStarredTrainds(params?: {
  limit?: number;
  cursor?: string;
}): Promise<StarListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.cursor) queryParams.append("cursor", params.cursor);

    const endpoint = `/star/list${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get starred trainds"
    );
  }
}

// Toggle star status for a traind using the star module API
export async function toggleTraindStar(
  traindId: string
): Promise<{ isStarred: boolean; starCount: number }> {
  try {
    const response = await httpClient.post(`/star/toggle/${traindId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to toggle star status"
    );
  }
}
