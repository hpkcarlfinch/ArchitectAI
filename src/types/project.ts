import type { BlueprintSchema, RenderMode } from "./blueprint";
import type { ChatMessage } from "./chat";

export interface ProjectMetadata {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlueprintProject extends ProjectMetadata {
  userId: string;
  chatHistory: ChatMessage[];
  blueprintJson: BlueprintSchema | null;
  renderMode: RenderMode;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
