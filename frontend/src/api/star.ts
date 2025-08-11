import httpClient from "./axios";

// API response types for star operations
export interface StarResponse {
  success: boolean;
  isStarred: boolean;
  starCount: number;
}

// Get star status for a traind
export async function getStarStatus(traindId: string): Promise<StarResponse> {
  try {
    const response = await httpClient.get(`/star/status/${traindId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get star status"
    );
  }
}

// Star a traind
export async function starTraind(traindId: string): Promise<StarResponse> {
  try {
    const response = await httpClient.post("/star", { traindId });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to star traind"
    );
  }
}

// Unstar a traind
export async function unstarTraind(traindId: string): Promise<StarResponse> {
  try {
    const response = await httpClient.delete(`/star/${traindId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to unstar traind"
    );
  }
}

// Toggle star status (star if unstarred, unstar if starred)
export async function toggleTraindStar(
  traindId: string
): Promise<StarResponse> {
  try {
    // First get current star status
    const currentStatus = await getStarStatus(traindId);

    // Toggle based on current status
    if (currentStatus.isStarred) {
      return await unstarTraind(traindId);
    } else {
      return await starTraind(traindId);
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to toggle star status"
    );
  }
}
