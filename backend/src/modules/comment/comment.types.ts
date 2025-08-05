export interface AddCommentInput {
  traindId: string;
  userId: string;
  text: string;
}

export interface ReplyInput {
  traindId: string;
  parentId: string;
  userId: string;
  text: string;
}

export interface GetCommentsInput {
  traindId: string;
  parentId?: string;
  cursorId?: string;
  limit?: number;
}

export interface FlatCommentNode {
  comment: {
    id: string;
    userId: string;
    traindId: string;
    content: string;
    createdAt: Date;
    parentId: string | null;
  };
  repliesCount: number;
}

export interface PaginatedCommentList {
  comments: FlatCommentNode[];
  nextCursor: string | null;
}
