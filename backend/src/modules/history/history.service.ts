import { PrismaClient, History } from "@prisma/client";
import {
  AddHistoryInput,
  RemoveHistoryInput,
  PaginatedHistoryList,
  GetViewedTraindsInput,
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

  async getViewedTrainds(
    input: GetViewedTraindsInput
  ): Promise<PaginatedHistoryList> {
    const { userId, cursor, limit = 10 } = input;

    // Get total count for the user
    const totalCount = await prisma.history.count({
      where: { userId },
    });

    // Build the query with pagination
    const whereClause: any = { userId };

    if (cursor) {
      const cursorItem = await prisma.history.findUnique({
        where: { id: cursor },
        select: { viewedAt: true },
      });

      if (!cursorItem) {
        throw new Error(
          "Invalid cursor: the specified cursor item does not exist"
        );
      }

      whereClause.OR = [
        { viewedAt: { lt: cursorItem.viewedAt } },
        {
          viewedAt: cursorItem.viewedAt,
          id: { lte: cursor },
        },
      ];
    }

    const histories = await prisma.history.findMany({
      where: whereClause,
      orderBy: [{ viewedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        traind: {
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
        },
      },
    });

    const hasNextPage = histories.length > limit;
    const historiesToReturn = hasNextPage
      ? histories.slice(0, limit)
      : histories;

    const viewedTrainds = historiesToReturn.map((history) => ({
      id: history.id,
      userId: history.userId,
      traindId: history.traindId,
      viewedAt: history.viewedAt,
      traind: {
        ...history.traind,
        isStarred: (history.traind as any).stars?.length > 0,
        stars: undefined,
      },
    }));

    const nextCursor = hasNextPage ? histories[limit].id : null;

    return {
      histories: viewedTrainds,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  },
};

export default historyService;
