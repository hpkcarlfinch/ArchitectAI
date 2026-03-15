export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  role: Exclude<Role, "system">;
  content: string;
  createdAt?: string;
}

export interface BlueprintRequest {
  message: string;
  chatHistory: ChatMessage[];
  projectTitle?: string;
}

export type BlueprintResponseStatus = "blueprint_ready" | "needs_clarification";

export interface BlueprintResponse {
  status: BlueprintResponseStatus;
  assistantMessage: string;
  blueprint?: unknown;
}
