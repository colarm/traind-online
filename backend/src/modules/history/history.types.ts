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
};

export type PaginatedHistoryList = {
  histories: ViewedTraind[];
  nextCursor?: string | null;
};
