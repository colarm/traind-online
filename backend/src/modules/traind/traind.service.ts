/**
 * Traind service
 * Handles business logic for Reddit analysis tasks and data management
 *
 * Filename: traind.service.ts
 * Author: Haicheng Zhao
 * Date: 2025-08-04
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-04
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import { PrismaClient, Traind } from "@prisma/client";
import {
  RunAnalysisInput,
  ExportedFile,
  PaginatedTraindList,
  GetMyTraindsInput,
  GetPendingTraindsInput,
} from "./traind.types";
import analysisClient from "../../shared/grpc/analysis.client";

const prisma = new PrismaClient();

const traindService = {
  /**
   * Start a new Reddit analysis task
   */
  // [AI-GENERATED: Claude, 2025-08-04]
  async runAnalysis(input: RunAnalysisInput): Promise<string> {
    const { userId, redditId, parameterSetId } = input;

    if (!redditId || !parameterSetId) {
      throw new Error("Reddit ID and Parameter Set ID are required");
    }

    // Get user preferences for default visibility setting
    const userPreference = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Use user's preference for making trainds public by default
    const isPublicByDefault =
      userPreference?.makeTraindsPublicAsDefault ?? true;

    // Create traind record with pending status
    const traind = await prisma.traind.create({
      data: {
        postId: redditId,
        subreddit: "",
        title: "",
        result: {},
        parameterSetId: parameterSetId,
        userId: userId,
        status: "pending",
        isPublic: isPublicByDefault,
      },
    });

    try {
      // Get parameter set details for ML service
      const parameterSet = await prisma.parameterSet.findUnique({
        where: { id: parameterSetId },
      });

      const parameters = parameterSet?.parameters || {};

      // Submit task to ML service
      const taskResponse = await analysisClient.addTask({
        redditPostId: redditId,
        parameters,
      });

      if (!taskResponse.success) {
        await prisma.traind.delete({ where: { id: traind.id } });
        throw new Error(
          `Analysis task submission failed: ${taskResponse.message}`
        );
      }

      // Store task ID in the traind record for tracking
      await prisma.traind.update({
        where: { id: traind.id },
        data: {
          result: { task_id: taskResponse.task_id },
        },
      });

      return traind.id;
    } catch (error) {
      await prisma.traind.delete({ where: { id: traind.id } });
      throw error;
    }
  },

  // Get a Traind record by ID with optional user ID for starred status
  async getTraindById(
    traindId: string,
    userId?: string
  ): Promise<(Traind & { isStarred?: boolean }) | null> {
    if (!traindId) throw new Error("Traind ID is required");

    const traindItem = await prisma.traind.findUnique({
      where: { id: traindId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            stars: true,
            comments: true,
          },
        },
        ...(userId && {
          stars: {
            where: { userId },
            select: { id: true },
          },
        }),
      },
    });

    if (!traindItem) {
      throw new Error("Traind record not found");
    }

    // Add isStarred field if user is provided
    const result = {
      ...traindItem,
      ...(userId && {
        isStarred: (traindItem as any).stars?.length > 0,
      }),
    };

    // Remove the stars array from response
    delete (result as any).stars;

    return result;
  },

  async setVisibility(
    traindId: string,
    isPublic: boolean
  ): Promise<Traind | null> {
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) return null;

    const updatedTraind = await prisma.traind.update({
      where: { id: traindId },
      data: { isPublic },
    });

    return updatedTraind;
  },

  async deleteTraind(traindId: string, userId: string): Promise<void> {
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) {
      throw new Error("Traind record not found");
    }

    // Check if the user is the owner of the traind
    if (existing.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own trainds");
    }

    // Delete all related records first to avoid foreign key constraint errors
    await prisma.$transaction(async (tx) => {
      // Delete all stars for this traind
      await tx.star.deleteMany({
        where: { traindId },
      });

      // Delete all comments for this traind
      await tx.comment.deleteMany({
        where: { traindId },
      });

      // Delete all history records for this traind
      await tx.history.deleteMany({
        where: { traindId },
      });

      // Finally delete the traind itself
      await tx.traind.delete({
        where: { id: traindId },
      });
    });
  },

  async getParameterSetId(traindId: string): Promise<string | null> {
    const traind = await prisma.traind.findUnique({
      where: { id: traindId },
      select: { parameterSetId: true },
    });

    if (!traind) {
      return null;
    }

    return traind.parameterSetId;
  },

  async getMyTrainds(input: GetMyTraindsInput): Promise<PaginatedTraindList> {
    const { userId, cursor, limit = 10 } = input;

    const totalCount = await prisma.traind.count({
      where: { userId },
    });

    const whereClause: any = { userId };

    if (cursor) {
      const cursorItem = await prisma.traind.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });

      if (!cursorItem) {
        throw new Error(
          "Invalid cursor: the specified cursor item does not exist"
        );
      }

      whereClause.OR = [
        { createdAt: { lt: cursorItem.createdAt } },
        {
          createdAt: cursorItem.createdAt,
          id: { lte: cursor },
        },
      ];
    }

    const trainds = await prisma.traind.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        _count: {
          select: {
            stars: true,
            comments: true,
          },
        },
        stars: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const hasNextPage = trainds.length > limit;
    const traindsToReturn = hasNextPage ? trainds.slice(0, limit) : trainds;

    // Add isStarred field and remove stars array
    const traindsWithStarStatus = traindsToReturn.map((traind) => ({
      ...traind,
      isStarred: (traind as any).stars.length > 0,
      stars: undefined, // Remove the stars array from response
    }));

    const nextCursor = hasNextPage ? trainds[limit].id : null;

    return {
      trainds: traindsWithStarStatus,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  },

  async getPendingTrainds(
    input: GetPendingTraindsInput
  ): Promise<PaginatedTraindList> {
    const { userId, limit = 10 } = input;

    // Get all pending/processing trainds for the user
    const pendingStatuses = ["pending", "processing"];

    const totalCount = await prisma.traind.count({
      where: {
        userId,
        status: {
          in: pendingStatuses,
        },
      },
    });

    const trainds = await prisma.traind.findMany({
      where: {
        userId,
        status: {
          in: pendingStatuses,
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      include: {
        _count: {
          select: {
            stars: true,
            comments: true,
          },
        },
        stars: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Add isStarred field and remove stars array
    const traindsWithStarStatus = trainds.map((traind) => ({
      ...traind,
      isStarred: (traind as any).stars.length > 0,
      stars: undefined, // Remove the stars array from response
    }));

    return {
      trainds: traindsWithStarStatus,
      nextCursor: null, // No pagination for pending trainds
      hasNextPage: false,
      totalCount,
    };
  },

  async getQueuePosition(traindId: string): Promise<{
    traindId: string;
    position: number;
    totalPending: number;
    status: string;
    message: string;
  } | null> {
    // First, get the traind record to find the task ID
    const traind = await prisma.traind.findUnique({
      where: { id: traindId },
      select: { id: true, result: true, status: true },
    });

    if (!traind) {
      return null;
    }

    // Get task ID from the result
    const taskId = (traind.result as any)?.task_id;
    if (!taskId) {
      return null;
    }

    try {
      // Get task status including queue position from ML service
      const taskStatus = await analysisClient.getTaskStatus(taskId);

      if (!taskStatus.success) {
        return null;
      }

      return {
        traindId: traindId,
        position: taskStatus.queue_position,
        totalPending: taskStatus.total_pending,
        status: taskStatus.status,
        message:
          taskStatus.queue_position > 0
            ? `Task is in queue at position ${taskStatus.queue_position}/${taskStatus.total_pending}`
            : taskStatus.status === "processing"
            ? "Task is currently being processed"
            : `Task status: ${taskStatus.status}`,
      };
    } catch (error) {
      console.error("Error getting queue position from ML service:", error);
      return null;
    }
  },

  // Internal API for ML service to update traind results
  async updateTraindResult(
    taskId: string,
    result: any,
    status: string = "completed",
    title?: string
  ): Promise<boolean> {
    try {
      // Find the traind record by task_id in the result field
      const traind = await prisma.traind.findFirst({
        where: {
          result: {
            path: ["task_id"],
            equals: taskId,
          },
          status: {
            in: ["pending", "processing"],
          },
        },
      });

      if (!traind) {
        console.error(`No pending traind record found for task ${taskId}`);
        return false;
      }

      // Update the traind record
      await prisma.traind.update({
        where: { id: traind.id },
        data: {
          result: result,
          status: status,
          ...(title && { title: title }),
        },
      });

      return true;
    } catch (error) {
      console.error(
        `Failed to update traind result for task ${taskId}:`,
        error
      );
      return false;
    }
  },

  // Internal API for ML service to mark traind as failed
  async updateTraindFailed(
    taskId: string,
    errorMessage: string
  ): Promise<boolean> {
    try {
      // Find the traind record by task_id in the result field
      const traind = await prisma.traind.findFirst({
        where: {
          result: {
            path: ["task_id"],
            equals: taskId,
          },
          status: {
            in: ["pending", "processing"],
          },
        },
      });

      if (!traind) {
        console.error(`No pending traind record found for task ${taskId}`);
        return false;
      }

      // Create error result
      const errorResult = {
        task_id: taskId,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };

      // Update the traind record to failed status
      await prisma.traind.update({
        where: { id: traind.id },
        data: {
          result: errorResult,
          status: "failed",
          title: "Analysis Failed",
        },
      });

      return true;
    } catch (error) {
      console.error(
        `Failed to update traind to failed for task ${taskId}:`,
        error
      );
      return false;
    }
  },
};

export default traindService;
