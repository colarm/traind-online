import { PrismaClient, UserPreference } from "@prisma/client";
import { UpdatePreferenceInput } from "./preference.types";

const prisma = new PrismaClient();

const preferenceService = {
  async update(
    input: UpdatePreferenceInput,
    userId: string
  ): Promise<UserPreference> {
    const { theme, makeTraindsPublicAsDefault, emailNotifications } = input;

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: { theme, makeTraindsPublicAsDefault, emailNotifications },
      create: { userId, theme, makeTraindsPublicAsDefault, emailNotifications },
    });
    return updated as UserPreference;
  },

  async get(userId: string): Promise<UserPreference | null> {
    const preference = await prisma.userPreference.findUnique({
      where: { userId },
    });
    if (!preference) {
      const newPreference = await prisma.userPreference.create({
        data: {
          userId,
          theme: "theme-cool-white",
          makeTraindsPublicAsDefault: true,
          emailNotifications: true,
        },
      });
      return newPreference as UserPreference;
    }
    return preference as UserPreference;
  },
};

export default preferenceService;
