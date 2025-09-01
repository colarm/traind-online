/**
 * Filename: comment.service.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-05
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-05
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

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
  // [STUDENT-WRITTEN]
  async add(input: AddCommentInput): Promise<Comment> {
    // Check if traind exists
    const traindExists = await prisma.traind.findUnique({
      where: { id: input.traindId },
    });
    if (!traindExists) {
      throw new Error("Traind not found");
    }

    // create the comment
    const comment = await prisma.comment.create({
      data: {
        userId: input.userId,
        traindId: input.traindId,
        content: input.text,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    if (!comment) {
      throw new Error("Failed to add comment");
    }

    return comment;
  },

  // [STUDENT-WRITTEN]
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
    const comment = await prisma.comment.create({
      data: {
        userId: input.userId,
        traindId: input.traindId,
        parentId: input.parentId,
        content: input.text,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    if (!comment) {
      throw new Error("Failed to reply to comment");
    }

    return comment;
  },

  // [AI-GENERATED: Claude, 2025-08-05]
  async getByTraind(input: GetCommentsInput): Promise<PaginatedCommentList> {
    const { traindId, parentId = null, cursorId, limit = 10 } = input;

    const comments = await prisma.comment.findMany({
      where: { traindId, parentId },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
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
