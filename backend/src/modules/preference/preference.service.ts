import { PrismaClient, UserPreference } from "@prisma/client";
import { UpdatePreferenceInput } from "./preference.types";

const prisma = new PrismaClient();

const preferenceService = {
  async update(
    input: UpdatePreferenceInput,
    userId: string
  ): Promise<UserPreference> {
    const { theme, language } = input;

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: { theme, language },
      create: { userId, theme, language },
    });
    return updated as UserPreference;
  },

  async get(userId: string): Promise<UserPreference | null> {
    const preference = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!preference) {
      const newPreference = await prisma.userPreference.create({
        data: { userId, theme: "light", language: "en" },
      });
      return newPreference as UserPreference;
    }
    return preference as UserPreference;
  },
};

export default preferenceService;
