import OpenAI from "openai";
import { AIEnvelope, parseAndNormalizeAIEnvelope } from "./blueprintSchema.js";
import { ChatMessage } from "./types.js";

const SYSTEM_PROMPT = `You are an expert residential architect and planning assistant.
Return ONLY valid JSON matching this exact shape:
{
  "status": "blueprint_ready" | "needs_clarification",
  "assistantMessage": "string",
  "blueprint"?: {
    "metadata": {
      "title": "string",
      "description": "string",
      "style"?: "string",
      "units": "m" | "ft",
      "lotWidth"?: number,
      "lotDepth"?: number
    },
    "floors": [
      {
        "id": "string",
        "level": number,
        "name": "string",
        "ceilingHeight": number,
        "rooms": [
          {
            "id": "string",
            "name": "string",
            "label"?: "string",
            "polygon": [{"x": number, "y": number}],
            "areaSqM"?: number,
            "floorMaterial"?: "string"
          }
        ],
        "walls": [
          {
            "id": "string",
            "start": {"x": number, "y": number},
            "end": {"x": number, "y": number},
            "thickness": number,
            "type": "exterior" | "interior",
            "materialId"?: "string"
          }
        ],
        "doors": [
          {
            "id": "string",
            "wallId"?: "string",
            "x": number,
            "y": number,
            "width": number,
            "swing": "left" | "right" | "double" | "sliding" | "none",
            "rotation": number,
            "type": "single" | "double" | "sliding" | "pocket" | "entry",
            "metadata"?: {"string": "string | number | boolean | null"}
          }
        ],
        "windows": [
          {
            "id": "string",
            "wallId"?: "string",
            "x": number,
            "y": number,
            "width": number,
            "height": number,
            "rotation": number,
            "type": "fixed" | "casement" | "sliding" | "picture" | "awning",
            "metadata"?: {"string": "string | number | boolean | null"}
          }
        ],
        "fixtures": [
          {
            "id": "string",
            "kind": "sink" | "toilet" | "bathtub" | "shower" | "stove" | "refrigerator" | "island" | "cabinet" | "washer" | "dryer" | "stairs" | "column" | "closet" | "bed" | "sofa" | "table" | "vanity" | "dishwasher" | "generic",
            "x": number,
            "y": number,
            "width": number,
            "height": number,
            "rotation": number,
            "roomId"?: "string",
            "symbol"?: "string",
            "materialId"?: "string",
            "metadata"?: {"string": "string | number | boolean | null"}
          }
        ],
        "annotations": [
          {
            "id": "string",
            "kind": "label" | "dimension" | "materialTag" | "elevationMarker" | "sectionMarker" | "note",
            "x": number,
            "y": number,
            "text": "string",
            "targetId"?: "string",
            "rotation"?: number
          }
        ]
      }
    ],
    "materials"?: [
      {
        "id": "string",
        "name": "string",
        "category": "wall" | "floor" | "roof" | "counter" | "fixture" | "generic",
        "hatchPattern": "string",
        "lineStyle": "solid" | "dashed" | "dotted",
        "label": "string",
        "colorHint"?: "string"
      }
    ],
    "annotations"?: [
      {
        "id": "string",
        "kind": "label" | "dimension" | "materialTag" | "elevationMarker" | "sectionMarker" | "note",
        "x": number,
        "y": number,
        "text": "string",
        "targetId"?: "string",
        "rotation"?: number
      }
    ],
    "roofZones"?: [
      {
        "id": "string",
        "level"?: number,
        "polygon": [{"x": number, "y": number}],
        "materialId"?: "string",
        "label"?: "string"
      }
    ],
    "legends"?: [
      {
        "title"?: "string",
        "items": [
          {
            "id": "string",
            "category": "symbol" | "material",
            "key": "string",
            "label": "string",
            "sample"?: "string"
          }
        ]
      }
    ],
    "roofHints"?: {"type"?: "string", "pitch"?: "string"},
    "materialHints"?: {"wall"?: "string", "roof"?: "string", "floor"?: "string"}
  }
}
Rules:
- Never output markdown.
- If critical details are missing, set status="needs_clarification" and ask one precise question in assistantMessage.
- If status="blueprint_ready", include blueprint with realistic dimensions and valid polygons.
- Keep coordinates in a coherent 2D plane and ensure room polygons do not self-intersect.
- Include doors, windows, fixtures, materials, and annotations whenever they can be inferred.
- Keep object ids stable and unique per list.
- If you are uncertain on a material, still include a generic material with clear label.
- Prefer meters for units unless user explicitly asks for feet.
`;

const makeClient = (apiKey: string): OpenAI => {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey,
    timeout: 60000,
    maxRetries: 0,
  });
};

const tryParse = (raw: string): AIEnvelope => {
  const parsed = JSON.parse(raw) as unknown;
  return parseAndNormalizeAIEnvelope(parsed);
};

const formatUnknownError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || error.toString();
  }

  if (typeof error === "object" && error !== null) {
    const maybe = error as { message?: string; error?: { message?: string } };
    if (maybe.message) {
      return maybe.message;
    }
    if (maybe.error?.message) {
      return maybe.error.message;
    }
    return JSON.stringify(error);
  }

  return String(error);
};

const isTimeoutError = (errorMessage: string): boolean => {
  const lower = errorMessage.toLowerCase();
  return lower.includes("timed out") || lower.includes("timeout") || lower.includes("deadline");
};

const extractJsonObject = (text: string): string => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }

  return text.slice(start, end + 1);
};

export async function generateBlueprintWithRetry(
  latestUserMessage: string,
  chatHistory: ChatMessage[],
  options: {
    apiKey: string;
    model: string;
  },
): Promise<AIEnvelope> {
  const startedAt = Date.now();
  const maxTotalDurationMs = 120000;
  const openai = makeClient(options.apiKey);

  const buildMessages = (historyLimit: number): Array<{ role: "system" | "user" | "assistant"; content: string }> => {
    const latestTrimmed = latestUserMessage.trim();
    const historyWithoutDuplicateLatest = [...chatHistory];
    const lastHistoryMessage = historyWithoutDuplicateLatest[historyWithoutDuplicateLatest.length - 1];
    if (lastHistoryMessage?.role === "user" && lastHistoryMessage.content.trim() === latestTrimmed) {
      historyWithoutDuplicateLatest.pop();
    }

    const limitedHistory = historyWithoutDuplicateLatest.slice(-historyLimit).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 800),
    }));

    return [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...limitedHistory,
      { role: "user" as const, content: latestUserMessage.slice(0, 1200) },
    ];
  };

  const modelCandidates = ["gpt-4o-mini", options.model].filter(
    (model, idx, arr) => arr.indexOf(model) === idx,
  );

  let lastErrorMessage = "Unknown generation error.";
  const modes: Array<"json_response_format" | "plain_text_json"> = ["json_response_format", "plain_text_json"];
  const historyLimits = [3, 1];

  for (const model of modelCandidates) {
    for (const historyLimit of historyLimits) {
      for (const mode of modes) {
        if (Date.now() - startedAt > maxTotalDurationMs) {
          lastErrorMessage = "Request timed out.";
          break;
        }

        try {
          const completionArgs: {
            model: string;
            messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
            response_format?: { type: "json_object" };
          } = {
            model,
            messages: buildMessages(historyLimit),
          };

          if (mode === "json_response_format") {
            completionArgs.response_format = { type: "json_object" };
          }

          const completion = await openai.chat.completions.create({
            ...completionArgs,
          });

          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error("Empty model response.");
          }

          if (mode === "json_response_format") {
            return tryParse(content);
          }

          return tryParse(extractJsonObject(content));
        } catch (error) {
          lastErrorMessage = formatUnknownError(error);
        }
      }
    }
  }

  if (isTimeoutError(lastErrorMessage)) {
    return parseAndNormalizeAIEnvelope({
      status: "needs_clarification",
      assistantMessage:
        "I can generate this blueprint, but the request took too long. Please try a shorter prompt first (rooms, style, and square footage), then I will refine it in follow-up steps.",
    });
  }

  throw new Error(`Failed to generate valid blueprint response: ${lastErrorMessage}`);
}
