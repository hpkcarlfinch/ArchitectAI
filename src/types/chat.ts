export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface AIResponseEnvelope {
  status: "blueprint_ready" | "needs_clarification";
  assistantMessage: string;
  blueprint?: unknown;
}
