import { Traind, User, ParameterSet } from "@prisma/client";

export type RunAnalysisInput = {
  userId: string;
  redditId: string;
  parameterSetId: string;
};

export type ExportedFile = {
  fileName: string;
  content: Buffer;
  format: "json" | "csv" | "png";
};

export type TraindWithCounts = Traind & {
  _count: {
    stars: number;
    comments: number;
  };
};

export type PaginatedTraindList = {
  trainds: TraindWithCounts[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
};

export type GetMyTraindsInput = {
  userId: string;
  cursor?: string;
  limit?: number;
};

export type GetPendingTraindsInput = {
  userId: string;
  limit?: number;
};
