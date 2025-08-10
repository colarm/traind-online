import httpClient from "./axios";

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
