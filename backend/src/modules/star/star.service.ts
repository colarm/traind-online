import { PrismaClient, Star } from "@prisma/client";
import { AddStarInput, RemoveStarInput, PaginatedStarList } from "./star.types";

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

  async getStarredTrainds(userId: string): Promise<PaginatedStarList> {
    // Fetch starred trainds for the user
    const stars = await prisma.star.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { traind: true },
    });

    // Map to the expected format
    const starredTrainds = stars.map((star) => ({
      id: star.id,
      userId: star.userId,
      traindId: star.traindId,
      createdAt: star.createdAt,
    }));

    return {
      stars: starredTrainds,
      nextCursor: null, // Implement pagination later
    } as PaginatedStarList;
  },
};

export default starService;
