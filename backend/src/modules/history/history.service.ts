import { PrismaClient, History } from "@prisma/client";
import {
  AddHistoryInput,
  RemoveHistoryInput,
  PaginatedHistoryList,
} from "./history.types";

const prisma = new PrismaClient();

const historyService = {
  // Adds a history entry for a traind
  // Returns true if the history entry was added, false if it already exists
  async addHistory(input: AddHistoryInput): Promise<History> {
    const { userId, traindId } = input;

    // Check if the history entry already exists
    const existing = await prisma.history.findUnique({
      where: { userId_traindId: { userId, traindId } },
    });
    if (existing) {
      throw new Error("History entry already exists");
    }

    // Check if the traind exists
    const traindExists = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!traindExists) {
      throw new Error("Traind does not exist");
    }

    // Create the history entry
    const history = await prisma.history.create({
      data: { userId, traindId },
    });
    if (!history) {
      throw new Error("Failed to create history entry");
    }

    return history;
  },

  async removeHistory(input: RemoveHistoryInput): Promise<History> {
    const { userId, traindId } = input;

    // Check if the history entry exists
    const existingHistory = await prisma.history.findUnique({
      where: { userId_traindId: { userId, traindId } },
    });
    if (!existingHistory) {
      throw new Error("History entry does not exist");
    }

    // Delete the history entry
    return await prisma.history.delete({
      where: { userId_traindId: { userId, traindId } },
    });
  },

  async getViewedTrainds(userId: string): Promise<PaginatedHistoryList> {
    // Fetch history entries for the user
    const histories = await prisma.history.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      include: { traind: true },
    });

    // Map to the expected format
    const viewedTrainds = histories.map((history) => ({
      id: history.id,
      userId: history.userId,
      traindId: history.traindId,
      viewedAt: history.viewedAt,
    }));

    return {
      histories: viewedTrainds,
      nextCursor: null, // Implement pagination later
    } as PaginatedHistoryList;
  },
};

export default historyService;
