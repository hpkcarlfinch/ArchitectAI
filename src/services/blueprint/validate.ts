import type { BlueprintSchema } from "../../types/blueprint";
import { normalizeBlueprint } from "./normalize";
import { blueprintSchema } from "./schema";

export const validateBlueprint = (input: unknown): BlueprintSchema => {
  const normalized = normalizeBlueprint(input);
  const parsed = blueprintSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Invalid blueprint schema: ${parsed.error.issues[0]?.message ?? "unknown issue"}`);
  }

  return parsed.data as BlueprintSchema;
};
