import httpClient from "./axios";
import { TraindWithPagination } from "./traind";

export interface HistoryItem {
  id: string;
  userId: string;
  traindId: string;
  viewedAt: string;
  traind?: TraindWithPagination;
}

export interface HistoryListResponse {
  histories: HistoryItem[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string | null;
}

// Add traind to history
export async function addToHistory(traindId: string): Promise<HistoryItem> {
  try {
    const response = await httpClient.post("/history/add", { traindId });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to add to history"
    );
  }
}

// Remove traind from history
export async function removeFromHistory(traindId: string): Promise<void> {
  try {
    await httpClient.post("/history/remove", { traindId });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to remove from history"
    );
  }
}

// Get user's history
export async function getHistory(params?: {
  limit?: number;
  cursor?: string;
}): Promise<HistoryListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.cursor) queryParams.append("cursor", params.cursor);

    const endpoint = `/history/list${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get history"
    );
  }
}
