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
};

export type PaginatedStarList = {
  stars: StarredTraind[];
  nextCursor?: string | null;
};
