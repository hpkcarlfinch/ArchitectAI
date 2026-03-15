import type { BlueprintSchema } from "../../types/blueprint";
import { blueprintSchema } from "./schema";

export const validateBlueprint = (input: unknown): BlueprintSchema => {
  const parsed = blueprintSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid blueprint schema: ${parsed.error.issues[0]?.message ?? "unknown issue"}`);
  }

  return parsed.data as BlueprintSchema;
};
