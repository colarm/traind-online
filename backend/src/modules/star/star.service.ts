import { PrismaClient, Star } from "@prisma/client";
import {
  AddStarInput,
  RemoveStarInput,
  PaginatedStarList,
  GetStarredTraindsInput,
} from "./star.types";

const prisma = new PrismaClient();

const starService = {
  // Adds a star to a traind
  // Returns true if the star was added, false if it already exists
  async addStar(input: AddStarInput): Promise<Star> {
    const { userId, traindId } = input;

    // Check if the star already exists
    const existing = await prisma.star.findUnique({
      where: { userId_traindId: { userId, traindId } },
    });
    if (existing) {
      throw new Error("Star already exists");
    }

    // Check if the traind exists
    const traindExists = await prisma.traind.findUnique({
      where: { id: traindId },
    });
    if (!traindExists) {
      throw new Error("Traind does not exist");
    }

    // Create the star
    const star = await prisma.star.create({
      data: { userId, traindId },
    });
    if (!star) {
      throw new Error("Failed to create star");
    }

    return star;
  },

  async removeStar(input: RemoveStarInput): Promise<Star> {
    const { userId, traindId } = input;

    // Check if the star exists
    const existingStar = await prisma.star.findUnique({
      where: { userId_traindId: { userId, traindId } },
    });
    if (!existingStar) {
      throw new Error("Star does not exist");
    }

    // Delete the star
    return await prisma.star.delete({
      where: { userId_traindId: { userId, traindId } },
    });
  },

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

    // If cursor is provided, add it to the where clause for pagination
    if (cursor) {
      whereClause.id = {
        lt: cursor, // Use 'lt' for descending order (newer items first)
      };
    }

    // Fetch starred trainds for the user with pagination
    const stars = await prisma.star.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Take one extra to determine if there's a next page
      include: { traind: true },
    });

    // Determine if there's a next page
    const hasNextPage = stars.length > limit;
    const starsToReturn = hasNextPage ? stars.slice(0, limit) : stars;

    // Map to the expected format
    const starredTrainds = starsToReturn.map((star) => ({
      id: star.id,
      userId: star.userId,
      traindId: star.traindId,
      createdAt: star.createdAt,
    }));

    // Get the next cursor (ID of the last item)
    const nextCursor =
      hasNextPage && starredTrainds.length > 0
        ? starredTrainds[starredTrainds.length - 1].id
        : null;

    return {
      stars: starredTrainds,
      nextCursor,
      hasNextPage,
      totalCount,
    };
  },
};

export default starService;
