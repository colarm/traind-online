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

// Add star to a traind
export async function starTraind(traindId: string): Promise<StarItem> {
  try {
    const response = await httpClient.post("/star/add", { traindId });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to star traind"
    );
  }
}

// Remove star from a traind
export async function unstarTraind(traindId: string): Promise<void> {
  try {
    await httpClient.post("/star/remove", { traindId });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to unstar traind"
    );
  }
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

// Check if a traind is starred by the current user
export async function isTraindStarred(traindId: string): Promise<boolean> {
  try {
    const response = await getStarredTrainds();
    return response.stars.some((star) => star.traindId === traindId);
  } catch (error: any) {
    // If we can't fetch starred trainds, assume not starred
    return false;
  }
}

// Toggle star status for a traind (star if unstarred, unstar if starred)
export async function toggleTraindStar(
  traindId: string
): Promise<{ isStarred: boolean; starCount?: number }> {
  try {
    // First check if the traind is currently starred
    const isCurrentlyStarred = await isTraindStarred(traindId);

    if (isCurrentlyStarred) {
      // Unstar the traind
      await unstarTraind(traindId);
      return { isStarred: false };
    } else {
      // Star the traind
      await starTraind(traindId);
      return { isStarred: true };
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to toggle star status"
    );
  }
}
