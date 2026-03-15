import type { BlueprintProject } from "../types/project";
import type { RenderMode } from "../types/blueprint";
import { makeId } from "../utils/id";

export const createEmptyProject = (userId = "demo-user", renderMode: RenderMode = "2d"): BlueprintProject => {
  const now = new Date().toISOString();
  return {
    id: makeId("project"),
    userId,
    title: "Untitled Project",
    description: "Describe your dream house in chat to generate a blueprint.",
    createdAt: now,
    updatedAt: now,
    chatHistory: [],
    blueprintJson: null,
    renderMode,
  };
};
