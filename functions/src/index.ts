import { initializeApp } from "firebase-admin/app";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { z } from "zod";
import { parseAndNormalizeAIEnvelope } from "./blueprintSchema.js";
import { openAIApiKey, openAIModel } from "./config.js";
import { generateBlueprintWithRetry } from "./openaiService.js";

initializeApp();

const resolveApiKey = (): string => {
  try {
    const fromSecret = openAIApiKey.value();
    if (fromSecret) {
      return fromSecret;
    }
  } catch {
    // Secret access may fail in local emulator when Secret Manager is not configured.
  }

  const fromLocalEnv = process.env.OPENAI_API_KEY_LOCAL;
  if (fromLocalEnv) {
    return fromLocalEnv;
  }

  throw new HttpsError(
    "failed-precondition",
    "OpenAI key not configured. Set OPENAI_API_KEY secret for deploy or OPENAI_API_KEY_LOCAL in functions/.env for emulator.",
  );
};

const requestSchema = z.object({
  message: z.string().trim().min(1),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
        createdAt: z.string().optional(),
      }),
    )
    .max(24)
    .default([]),
  projectTitle: z.string().optional(),
});

export const generateBlueprint = onCall(
  {
    cors: true,
    region: "us-central1",
    timeoutSeconds: 300,
    memory: "512MiB",
    secrets: [openAIApiKey],
  },
  async (request) => {
    const parsed = requestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError("invalid-argument", "Invalid request body.", parsed.error.flatten());
    }

    const { message, chatHistory } = parsed.data;

    try {
      const aiResponse = await generateBlueprintWithRetry(message, chatHistory, {
        apiKey: resolveApiKey(),
        model: openAIModel.value(),
      });
      const valid = parseAndNormalizeAIEnvelope(aiResponse);

      if (valid.status === "blueprint_ready" && !valid.blueprint) {
        throw new HttpsError("failed-precondition", "AI response marked blueprint_ready but no blueprint payload exists.");
      }

      return valid;
    } catch (error) {
      logger.error("generateBlueprint failed", {
        message,
        chatHistoryLength: chatHistory.length,
        error: error instanceof Error ? error.message : String(error),
      });
      const errorMessage = error instanceof Error ? error.message : "Unknown generation error.";
      throw new HttpsError("internal", `Blueprint generation failed: ${errorMessage}`);
    }
  },
);
