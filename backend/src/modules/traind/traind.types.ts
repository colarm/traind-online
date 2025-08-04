import { Traind, User, ParameterSet } from "@prisma/client";

export type RunAnalysisInput = {
  userId: string;
  redditId: string;
  parameterSetId: string;
};

export type ExportedFile = {
  fileName: string;
  content: Buffer;
  format: "json" | "csv" | "png";
};