import httpClient from "./axios";

export interface HelpTitle {
  id: string;
  title: string;
}

export interface HelpContent {
  id: string;
  title: string;
  content: string;
}

export const listHelpTitles = async (): Promise<HelpTitle[]> => {
  try {
    const response = await httpClient.get("/help");
    return response.data;
  } catch (error) {
    console.error("Error fetching help titles:", error);
    throw error;
  }
};

export const getHelpById = async (id: string): Promise<HelpContent> => {
  try {
    const response = await httpClient.get(`/help/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching help content:", error);
    throw error;
  }
};
