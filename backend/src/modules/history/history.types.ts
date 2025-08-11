import { Traind } from "@prisma/client";

export type AddHistoryInput = {
  userId: string;
  traindId: string;
};

export type RemoveHistoryInput = {
  userId: string;
  traindId: string;
};

export type ViewedTraind = {
  id: string;
  userId: string;
  traindId: string;
  viewedAt: Date;
  traind?: Traind & {
    _count: {
      stars: number;
      comments: number;
    };
  };
};

export type PaginatedHistoryList = {
  histories: ViewedTraind[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
};

export type GetViewedTraindsInput = {
  userId: string;
  cursor?: string;
  limit?: number;
};
