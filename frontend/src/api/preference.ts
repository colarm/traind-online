import httpClient from "./axios";

export interface UserPreferences {
  theme?: string;
  defaultClusterCount?: number;
  defaultSubreddits?: string[];
  emailNotifications?: boolean;
  publicByDefault?: boolean;
  language?: string;
  timezone?: string;
}

export interface PreferenceResponse {
  success: boolean;
  preferences: UserPreferences;
}

// Get user preferences
export async function getPreferences(): Promise<PreferenceResponse> {
  try {
    const response = await httpClient.get("/preference");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get preferences"
    );
  }
}

// Update user preferences
export async function updatePreferences(
  preferences: UserPreferences
): Promise<PreferenceResponse> {
  try {
    const response = await httpClient.put("/preference", preferences);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update preferences"
    );
  }
}
