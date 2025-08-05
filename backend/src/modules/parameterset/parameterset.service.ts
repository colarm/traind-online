import { PrismaClient, ParameterSet } from "@prisma/client";
import {
  SaveParameterSetInput,
  LoadParameterSetInput,
  CopyParameterInput,
} from "./parameterset.types";

const prisma = new PrismaClient();

export const parameterSetService = {
  async saveConfig(input: SaveParameterSetInput): Promise<ParameterSet> {
    const { userId, name, config } = input;

    const created = await prisma.parameterSet.create({
      data: {
        userId,
        name,
        parameters: JSON.parse(JSON.stringify(config)),
      },
    });

    return created;
  },

  async loadConfig(input: LoadParameterSetInput): Promise<ParameterSet> {
    const paramSet = await prisma.parameterSet.findUnique({
      where: { id: input.id },
    });

    if (!paramSet) throw new Error("ParameterSet not found");

    return paramSet;
  },

  async copyFromTraind(
    input: CopyParameterInput,
    userId: string
  ): Promise<ParameterSet> {
    const traind = await prisma.traind.findUnique({
      where: { id: input.traindId },
    });

    if (!traind) throw new Error("Traind not found");
		
		// Create a new ParameterSet based on the Traind's parameters
		if (!traind.parameterSetId) {
			throw new Error("Traind does not have a parameter set");
		}

		// Find the existing ParameterSet associated with the Traind
		const existingParamSet = await prisma.parameterSet.findUnique({
			where: { id: traind.parameterSetId },
		});
		if (!existingParamSet) {
			throw new Error("ParameterSet associated with Traind not found");
		}

		// Create a new ParameterSet with the same parameters
		// but with a new name and userId
		if (!input.name) {
			throw new Error("Name is required for copying parameter set");
		}

		// Create the new ParameterSet
		const copiedParameters = JSON.parse(JSON.stringify(existingParamSet.parameters));
		if (!copiedParameters) {
			throw new Error("No parameters found in the existing ParameterSet");
		}

    const copied = await prisma.parameterSet.create({
			data: {
				userId,
				name: input.name,
				parameters: copiedParameters,
			},
		});

    return copied;
  },
};
