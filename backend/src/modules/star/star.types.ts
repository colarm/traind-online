import { Traind } from "@prisma/client";

export type AddStarInput = {
  userId: string;
  traindId: string;
};

export type RemoveStarInput = {
  userId: string;
  traindId: string;
};

export type StarredTraind = {
  id: string;
  userId: string;
  traindId: string;
  createdAt: Date;
  traind?: Traind & {
    _count: {
      stars: number;
      comments: number;
    };
  };
};

export type PaginatedStarList = {
  stars: StarredTraind[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
};

export type GetStarredTraindsInput = {
  userId: string;
  cursor?: string;
  limit?: number;
};
