import { PrismaClient, Traind } from "@prisma/client";
import {
  RunAnalysisInput,
  ExportedFile,
  PaginatedTraindList,
  GetMyTraindsInput,
} from "./traind.types";
import analysisClient from "../../shared/grpc/analysis.client";

const prisma = new PrismaClient();

const traindService = {
  async runAnalysis(input: RunAnalysisInput): Promise<string> {
    const { userId, redditId, parameterSetId } = input;

    if (!redditId || !parameterSetId) {
      throw new Error("Reddit ID and Parameter Set ID are required");
    }

    const traind = await prisma.traind.create({
      data: {
        postId: redditId,
        subreddit: "",
        title: "",
        result: {},
        parameterSetId: parameterSetId,
        userId: userId,
      },
    });

    const success = await analysisClient.runAnalysis({
      traindId: traind.id,
      redditId,
      parameterSetId,
      userId,
    });

    if (!success) {
      await prisma.traind.delete({ where: { id: traind.id } });
      throw new Error("Analysis failed");
    }

    return traind.id;
  },

  // Enhanced getTraindById with star status for specific user
  async getTraindById(
    traindId: string,
    userId?: string
  ): Promise<(Traind & { isStarred?: boolean }) | null> {
    if (!traindId) throw new Error("Traind ID is required");

    const traindItem = await prisma.traind.findUnique({
      where: { id: traindId },
      include: {
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

    if (traindItem.status !== "completed") {
      const traind = await analysisClient.getResult(traindId);
      if (!traind) {
        throw new Error("Traind record not found in gRPC service");
      }

      const updatedTraind = await prisma.traind.update({
        where: { id: traindId },
        data: {
          title: traind.title,
          result: traind.result,
        },
      });
      if (!updatedTraind) {
        throw new Error("Failed to update Traind record");
      }

      return updatedTraind as Traind;
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

  async deleteTraind(traindId: string): Promise<void> {
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) {
      throw new Error("Traind record not found");
    }

    await prisma.traind.delete({ where: { id: traindId } });
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
};

export default traindService;
