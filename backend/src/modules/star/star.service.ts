import { PrismaClient, Star } from "@prisma/client";
import { AddStarInput, RemoveStarInput } from "./star.types";

const prisma = new PrismaClient();

export const starService = {

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

  async getStarredTrainds(userId: string) {
    return await prisma.star.findMany({
      where: { userId },
      include: { traind: true },
    });
  },
};
