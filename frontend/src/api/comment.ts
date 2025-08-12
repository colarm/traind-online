import httpClient from "./axios";

export interface Comment {
  id: string;
  traindId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: { id: string; email: string };
  parentId?: string;
}

export interface CommentNode {
  comment: Comment;
  repliesCount: number;
}

export interface CommentListResponse {
  comments: CommentNode[];
  nextCursor: string | null;
}

export async function getComments(
  traindId: string,
  parentId?: string,
  cursorId?: string,
  limit?: number
): Promise<CommentListResponse> {
  const params = new URLSearchParams();
  if (parentId) params.append("parentId", parentId);
  if (cursorId) params.append("cursorId", cursorId);
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = `/comment/${traindId}${queryString ? `?${queryString}` : ""}`;

  const res = await httpClient.get(url);
  return res.data;
}

export async function addComment(traindId: string, text: string) {
  const res = await httpClient.post("/comment", {
    traindId,
    text,
  });
  return res.data;
}

export async function replyToComment(
  traindId: string,
  parentId: string,
  text: string
) {
  const res = await httpClient.post("/comment/reply", {
    traindId,
    parentId,
    text,
  });
  return res.data;
}
