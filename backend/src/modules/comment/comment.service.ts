import { PrismaClient, Comment } from "@prisma/client";
import {
  AddCommentInput,
  ReplyInput,
  GetCommentsInput,
  FlatCommentNode,
  PaginatedCommentList,
} from "./comment.types";

const prisma = new PrismaClient();

const commentService = {
	async add(input: AddCommentInput): Promise<Comment> {
		
		// Check if traind exists
		const traindExists = await prisma.traind.findUnique({
			where: { id: input.traindId },
		});
		if (!traindExists) {
			throw new Error("Traind not found");
		}

		// create the comment
    const comment = prisma.comment.create({
      data: {
        userId: input.userId,
        traindId: input.traindId,
        content: input.text,
      },
		});
		if (!comment) {
			throw new Error("Failed to add comment");
		}

		return comment;
  },

	async reply(input: ReplyInput) {
    // Check if traind exists
    const traindExists = await prisma.traind.findUnique({
      where: { id: input.traindId },
    });
    if (!traindExists) {
      throw new Error("Traind not found");
    }

    // Check if parent comment exists
    const parentCommentExists = await prisma.comment.findUnique({
      where: { id: input.parentId },
    });
    if (!parentCommentExists) {
      throw new Error("Parent comment not found");
    }
		
		// Create the reply comment
    const comment = prisma.comment.create({
      data: {
        userId: input.userId,
        traindId: input.traindId,
        parentId: input.parentId,
        content: input.text,
      },
    });
    if (!comment) {
      throw new Error("Failed to reply to comment");
    }

    return comment;
  },

  async getByTraind(input: GetCommentsInput): Promise<PaginatedCommentList> {
    const { traindId, parentId = null, cursorId, limit = 10 } = input;

    const comments = await prisma.comment.findMany({
      where: { traindId, parentId },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(cursorId && {
        cursor: { id: cursorId },
        skip: 1,
      }),
    });

    const nodes: FlatCommentNode[] = await Promise.all(
      comments.slice(0, limit).map(async (comment) => {
        const repliesCount = await prisma.comment.count({
          where: { parentId: comment.id },
        });

        return {
          comment,
          repliesCount,
        };
      })
    );

    const nextCursor = comments.length > limit ? comments[limit].id : null;

    return { comments: nodes, nextCursor } as PaginatedCommentList;
  },
};

export default commentService;
