import { PrismaClient, Traind } from "@prisma/client";
import {
  RunAnalysisInput,
  ExportedFile,
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
      return null;
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
  }
};

export default traindService;
