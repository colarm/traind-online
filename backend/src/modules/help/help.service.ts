import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const helpService = {
  async listTitles(): Promise<{ id: string; title: string }[]> {
    return await prisma.help.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getById(
    id: string
	): Promise<{ id: string; title: string; content: string }> {
    const help = await prisma.help.findUnique({
      where: { id },
		});
		if (!help) {
			throw new Error(`Help with id ${id} not found`);
		}
		return {
			id: help.id,
			title: help.title,
			content: help.content,
		};
  },
};

export default helpService;
