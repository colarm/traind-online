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
  // Run gRPC analysis task
  async runAnalysis(input: RunAnalysisInput): Promise<string> {
    const { userId, redditId, parameterSetId } = input;

    // Validate input
    if (!redditId || !parameterSetId) {
      throw new Error("Reddit ID and Parameter Set ID are required");
    }

    // Create an empty Traind record
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

    // Trigger gRPC analysis
    const success = await analysisClient.runAnalysis({
      traindId: traind.id,
      redditId,
      parameterSetId,
      userId,
    });

    // Check if the analysis was successful
    if (!success) {
      // If not successful, delete the Traind record
      await prisma.traind.delete({ where: { id: traind.id } });
      throw new Error("Analysis failed");
    }

    return traind.id;
  },

  // Get Traind record by Traind ID
  async getTraindById(traindId: string): Promise<Traind | null> {
    // use gRPC to fetch Traind record with relations
    const traind = await analysisClient.getResult(traindId);

    // If the Traind record is found, return null
    if (!traind) {
      throw new Error("Traind record not found in gRPC service");
    }

    // Check if the Traind record exists in the database
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) {
      throw new Error("Traind record not found in database");
    }

    // Update the Traind record in the database
    const updatedTraind = await prisma.traind.update({
      where: { id: traindId },
      data: {
        title: traind.title,
        result: traind.result,
      },
    });

    return updatedTraind as Traind;
  },

  // Export Traind data implemente after the analysis is complete

  // Set visibility of Traind record
  async setVisibility(
    traindId: string,
    isPublic: boolean
  ): Promise<Traind | null> {
    // Check if the Traind record exists
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) return null;

    // Update the visibility of the Traind record
    const updatedTraind = await prisma.traind.update({
      where: { id: traindId },
      data: { isPublic },
    });

    console.log(`Traind record ${traindId} visibility updated to ${isPublic}`);

    return updatedTraind;
  },

  // Delete Traind record
  async deleteTraind(traindId: string): Promise<void> {
    // Check if the Traind record exists
    const existing = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!existing) {
      throw new Error("Traind record not found");
    }

    // Delete the Traind record from the database
    await prisma.traind.delete({ where: { id: traindId } });
  },

  // Get parameter set ID by Traind ID
  async getParameterSetId(traindId: string): Promise<string | null> {
    // Find the Traind record by ID
    const traind = await prisma.traind.findUnique({
      where: { id: traindId },
      select: { parameterSetId: true },
    });

    // If Traind record is not found, return null
    if (!traind) {
      return null;
    }

    return traind.parameterSetId;
  },

  // Get all trainds for a user with pagination
  async getMyTrainds(input: GetMyTraindsInput): Promise<PaginatedTraindList> {
    const { userId, cursor, limit = 10 } = input;

    // Get total count for the user
    const totalCount = await prisma.traind.count({
      where: { userId },
    });

    // Build the query with pagination
    const whereClause: any = { userId };

    // If cursor is provided, add it to the where clause for pagination
    if (cursor) {
      whereClause.id = {
        lt: cursor, // Use 'lt' for descending order (newer items first)
      };
    }

    // Find trainds with pagination
    const trainds = await prisma.traind.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Take one extra to determine if there's a next page
      include: {
        _count: {
          select: {
            stars: true,
            comments: true,
          },
        },
      },
    });

    // Determine if there's a next page
    const hasNextPage = trainds.length > limit;
    const traindsToReturn = hasNextPage ? trainds.slice(0, limit) : trainds;

    // Get the next cursor (ID of the last item)
    const nextCursor =
      hasNextPage && traindsToReturn.length > 0
        ? traindsToReturn[traindsToReturn.length - 1].id
        : null;

    return {
      trainds: traindsToReturn,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  },
};

export default traindService;
