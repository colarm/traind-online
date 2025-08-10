import httpClient from "./axios";

export async function saveParameterSet(data: { name: string; config: any }) {
  try {
    const response = await httpClient.post("/parameterset/save", data);
    return response.data;
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Save parameter set failed",
    };
  }
}

export async function loadParameterSet(id: string) {
  try {
    const response = await httpClient.get(`/parameterset/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Load parameter set failed",
    };
  }
}

export async function copyParameterSetFromTraind(
  traindId: string,
  name: string
) {
  try {
    const response = await httpClient.post("/parameterset/copy", {
      traindId,
      name,
    });
    return response.data;
  } catch (error: any) {
    return {
      error: error?.response?.data?.message || "Copy parameter set failed",
    };
  }
}
