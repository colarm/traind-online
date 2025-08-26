/**
 * Help content API functions
 * Handles fetching help documentation from the server
 */

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

// Fetch list of available help topics
export const listHelpTitles = async (): Promise<HelpTitle[]> => {
  try {
    const response = await httpClient.get("/help");
    return response.data;
  } catch (error) {
    console.error("Error fetching help titles:", error);
    throw error;
  }
};

// Fetch detailed content for a specific help topic
export const getHelpById = async (id: string): Promise<HelpContent> => {
  try {
    const response = await httpClient.get(`/help/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching help content:", error);
    throw error;
  }
};
