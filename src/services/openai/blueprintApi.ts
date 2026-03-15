import { httpsCallable } from "firebase/functions";
import { FirebaseError } from "firebase/app";
import type { AIResponseEnvelope, ChatMessage } from "../../types/chat";
import { functions } from "../firebase/firebaseClient";

interface GenerateBlueprintRequest {
  message: string;
  chatHistory: Pick<ChatMessage, "role" | "content" | "createdAt">[];
  projectTitle?: string;
}

const generateBlueprintFn = httpsCallable<GenerateBlueprintRequest, AIResponseEnvelope>(
  functions,
  "generateBlueprint",
  {
    timeout: 180000,
  },
);

export const generateBlueprint = async (
  payload: GenerateBlueprintRequest,
): Promise<AIResponseEnvelope> => {
  try {
    const result = await generateBlueprintFn(payload);
    return result.data;
  } catch (error) {
    const candidate = error as {
      code?: string;
      message?: string;
      details?: unknown;
      customData?: { details?: unknown };
    };

    if (error instanceof FirebaseError) {
      const details = candidate.customData?.details ?? candidate.details;
      const detailString = details ? ` Details: ${JSON.stringify(details)}` : "";
      throw new Error(`Function call failed (${error.code}): ${error.message}${detailString}`);
    }

    if (candidate.code || candidate.message) {
      const details = candidate.details ?? candidate.customData?.details;
      const detailString = details ? ` Details: ${JSON.stringify(details)}` : "";
      throw new Error(
        `Function call failed (${candidate.code ?? "unknown"}): ${candidate.message ?? "Unknown error"}${detailString}`,
      );
    }

    throw new Error(`Function call failed: ${String(error)}`);
  }
};
