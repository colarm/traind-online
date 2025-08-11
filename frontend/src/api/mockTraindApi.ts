import { Traind } from "../types/traind";

// Mock data for development
const mockTrainds: Traind[] = [
  {
    id: "1",
    postId: "1234567890",
    subreddit: "MachineLearning",
    title: "Deep Learning Analysis of Reddit Sentiment",
    result: {
      mock: true,
    },
    parameterSetId: "ps1",
    isPublic: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    user: {
      id: "user1",
      email: "researcher@example.com",
    },
    _count: {
      stars: 15,
      comments: 8,
    },
  },
  {
    id: "2",
    postId: "0987654321",
    subreddit: "technology",
    title: "AI Discussion Trends in Tech Communities",
    result: {
      mock: true,
    },
    parameterSetId: "ps2",
    isPublic: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userId: "user2",
    user: {
      id: "user2",
      email: "techuser@example.com",
    },
    _count: {
      stars: 23,
      comments: 12,
    },
  },
  {
    id: "3",
    postId: "1122334455",
    subreddit: "datascience",
    title: "Clustering Analysis of Data Science Career Posts",
    result: { mock: true },
    parameterSetId: "ps3",
    isPublic: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    user: {
      id: "user1",
      email: "researcher@example.com",
    },
    _count: {
      stars: 8,
      comments: 3,
    },
  },
  {
    id: "4",
    postId: "5566778899",
    subreddit: "programming",
    title: "Programming Language Preferences Analysis",
    result: {
      clusters: [
        { id: 0, size: 89, keywords: ["javascript", "python", "popular"] },
        { id: 1, size: 45, keywords: ["rust", "go", "modern"] },
        { id: 2, size: 23, keywords: ["legacy", "maintenance", "old"] },
      ],
      summary: "JavaScript and Python dominate programming discussions",
    },
    parameterSetId: "ps4",
    isPublic: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user3",
    user: {
      id: "user3",
      email: "coder@example.com",
    },
    _count: {
      stars: 31,
      comments: 18,
    },
  },
  {
    id: "5",
    postId: "9988776655",
    subreddit: "artificial",
    title: "AI Ethics Discourse Clustering",
    result: {
      clusters: [
        { id: 0, size: 67, keywords: ["ethics", "bias", "fairness"] },
        { id: 1, size: 43, keywords: ["regulation", "policy", "government"] },
        {
          id: 2,
          size: 29,
          keywords: ["industry", "companies", "responsibility"],
        },
      ],
      summary: "Strong focus on ethical considerations and regulatory needs",
    },
    parameterSetId: "ps5",
    isPublic: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: "user2",
    user: {
      id: "user2",
      email: "techuser@example.com",
    },
    _count: {
      stars: 19,
      comments: 7,
    },
  },
];

// Mock API functions with delay to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type MockApiResponse<T> =
  | {
      data: T;
      total: number;
      hasMore: boolean;
    }
  | {
      error: string;
    };

export type MockApiSuccessResponse =
  | {
      success: boolean;
    }
  | {
      error: string;
    };

export const mockTraindApi = {
  async getPublicTrainds(params?: {
    limit?: number;
    offset?: number;
  }): Promise<MockApiResponse<Traind[]>> {
    await delay(800);
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    const publicTrainds = mockTrainds.filter((traind) => traind.isPublic);
    const paginatedResults = publicTrainds.slice(offset, offset + limit);

    return {
      data: paginatedResults,
      total: publicTrainds.length,
      hasMore: offset + limit < publicTrainds.length,
    };
  },

  async getMyTrainds(params?: {
    limit?: number;
    offset?: number;
  }): Promise<MockApiResponse<Traind[]>> {
    await delay(600);
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;

    const myTrainds = mockTrainds.filter((traind) => traind.userId === "user1");
    const paginatedResults = myTrainds.slice(offset, offset + limit);

    return {
      data: paginatedResults,
      total: myTrainds.length,
      hasMore: offset + limit < myTrainds.length,
    };
  },

  async getTrainds(params?: {
    userId?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<MockApiResponse<Traind[]>> {
    await delay(700);
    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    let filteredTrainds = [...mockTrainds];

    if (params?.userId) {
      filteredTrainds = filteredTrainds.filter(
        (traind) => traind.userId === params.userId
      );
    }

    if (params?.isPublic !== undefined) {
      filteredTrainds = filteredTrainds.filter(
        (traind) => traind.isPublic === params.isPublic
      );
    }

    const paginatedResults = filteredTrainds.slice(offset, offset + limit);

    return {
      data: paginatedResults,
      total: filteredTrainds.length,
      hasMore: offset + limit < filteredTrainds.length,
    };
  },

  async toggleTraindStar(traindId: string): Promise<MockApiSuccessResponse> {
    await delay(300);
    const traind = mockTrainds.find((t) => t.id === traindId);
    if (traind && traind._count) {
      traind._count.stars += Math.random() > 0.5 ? 1 : -1;
      traind._count.stars = Math.max(0, traind._count.stars);
    }
    return { success: true };
  },

  async deleteTraind(traindId: string): Promise<MockApiSuccessResponse> {
    await delay(400);
    const index = mockTrainds.findIndex((t) => t.id === traindId);
    if (index > -1) {
      mockTrainds.splice(index, 1);
      return { success: true };
    }
    return { error: "Traind not found" };
  },

  async getTraindById(traindId: string): Promise<MockApiResponse<Traind>> {
    await delay(200);
    const traind = mockTrainds.find((t) => t.id === traindId);
    if (traind) {
      return { data: traind, total: 1, hasMore: false };
    }
    return { error: "Traind not found" };
  },
};
