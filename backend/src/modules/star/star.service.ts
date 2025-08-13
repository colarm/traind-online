import { PrismaClient, Star } from "@prisma/client";
import {
  AddStarInput,
  RemoveStarInput,
  PaginatedStarList,
  GetStarredTraindsInput,
} from "./star.types";

const prisma = new PrismaClient();

const starService = {
  async getStarredTrainds(
    input: GetStarredTraindsInput
  ): Promise<PaginatedStarList> {
    const { userId, cursor, limit = 10 } = input;

    // Get total count for the user
    const totalCount = await prisma.star.count({
      where: { userId },
    });

    // Build the query with pagination
    const whereClause: any = { userId };

    if (cursor) {
      const cursorItem = await prisma.star.findUnique({
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

    const stars = await prisma.star.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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

    const hasNextPage = stars.length > limit;
    const starsToReturn = hasNextPage ? stars.slice(0, limit) : stars;

    const starredTrainds = starsToReturn.map((star) => ({
      id: star.id,
      userId: star.userId,
      traindId: star.traindId,
      createdAt: star.createdAt,
      traind: {
        ...star.traind,
        isStarred: true,
        stars: undefined
      },
    }));

    const nextCursor = hasNextPage ? stars[limit].id : null;

    return {
      stars: starredTrainds,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  },

  // Toggle star status for a traind (add if not exist, remove if exists)
  async toggleStar(input: {
    userId: string;
    traindId: string;
  }): Promise<{ isStarred: boolean; starCount: number }> {
    const { userId, traindId } = input;

    // Check if the traind exists
    const traindExists = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!traindExists) {
      throw new Error("Traind does not exist");
    }

    // Check if the star already exists
    const existingStar = await prisma.star.findUnique({
      where: { userId_traindId: { userId, traindId } },
    });

    if (existingStar) {
      // Remove the star
      await prisma.star.delete({
        where: { userId_traindId: { userId, traindId } },
      });
    } else {
      // Add the star
      await prisma.star.create({
        data: { userId, traindId },
      });
    }

    // Get updated star count
    const starCount = await prisma.star.count({
      where: { traindId },
    });

    return {
      isStarred: !existingStar, // true if star was added, false if removed
      starCount,
    };
  },
};

export default starService;
