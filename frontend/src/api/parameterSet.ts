import httpClient from "./axios";

export interface ParameterSet {
  id: string;
  name: string;
  parameters: any; // Backend uses 'parameters' not 'config'
  userId: string;
  createdAt: string;
  traindId?: string;
}

export interface ParameterSetListResponse {
  parameterSets: ParameterSet[];
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string | null;
}

// Save a new parameter set
export async function saveParameterSet(data: {
  name: string;
  config: any;
}): Promise<ParameterSet> {
  try {
    const response = await httpClient.post("/parameterset/save", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to save parameter set"
    );
  }
}

// Load a parameter set by ID
export async function loadParameterSet(id: string): Promise<ParameterSet> {
  try {
    const response = await httpClient.get(`/parameterset/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to load parameter set"
    );
  }
}

// Copy parameter set from an existing traind
export async function copyParameterSetFromTraind(
  traindId: string,
  name: string
): Promise<ParameterSet> {
  try {
    const response = await httpClient.post("/parameterset/copy", {
      traindId,
      name,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to copy parameter set from traind"
    );
  }
}

// Get user's parameter sets with pagination
export async function getParameterSets(params?: {
  limit?: number;
  cursor?: string;
}): Promise<ParameterSetListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.cursor) queryParams.append("cursor", params.cursor);

    const endpoint = `/parameterset/my${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await httpClient.get(endpoint);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to get parameter sets"
    );
  }
}
