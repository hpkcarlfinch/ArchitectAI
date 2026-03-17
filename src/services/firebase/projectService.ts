import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import type { BlueprintProject } from "../../types/project";
import type { ChatMessage } from "../../types/chat";
import type { RenderMode } from "../../types/blueprint";
import { normalizeProjectBlueprintValue, PROJECT_RENDER_MODE_DEFAULT } from "../blueprint/normalize";
import { db } from "./firebaseClient";

const userProjectsRef = (userId: string) => collection(db, "users", userId, "projects");

const removeUndefinedFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const asString = (value: unknown, fallback = ""): string => {
  return typeof value === "string" ? value : fallback;
};

const normalizeRenderMode = (value: unknown): RenderMode => {
  return value === "3d" ? "3d" : PROJECT_RENDER_MODE_DEFAULT;
};

const normalizeChatHistory = (value: unknown): ChatMessage[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const source = asRecord(item);
      const role = source.role === "assistant" ? "assistant" : source.role === "user" ? "user" : null;
      const content = asString(source.content);
      if (!role || !content.trim()) {
        return null;
      }

      return {
        id: asString(source.id, crypto.randomUUID()),
        role,
        content,
        createdAt: asString(source.createdAt, new Date().toISOString()),
      };
    })
    .filter((item): item is ChatMessage => item !== null);
};

const normalizeProject = (userId: string, projectId: string, rawData: unknown): BlueprintProject => {
  const source = asRecord(rawData);
  const nowIso = new Date().toISOString();

  return {
    id: projectId,
    userId: asString(source.userId, userId),
    title: asString(source.title, "Untitled Project"),
    description: asString(source.description, "Describe your dream house in chat to generate a blueprint."),
    createdAt: asString(source.createdAt, nowIso),
    updatedAt: asString(source.updatedAt, nowIso),
    chatHistory: normalizeChatHistory(source.chatHistory),
    blueprintJson: normalizeProjectBlueprintValue(source.blueprintJson),
    renderMode: normalizeRenderMode(source.renderMode),
  };
};

const normalizeProjectForSave = (
  payload: Omit<BlueprintProject, "id" | "createdAt" | "updatedAt" | "userId">,
): Omit<BlueprintProject, "id" | "createdAt" | "updatedAt" | "userId"> => {
  return {
    ...payload,
    chatHistory: normalizeChatHistory(payload.chatHistory),
    blueprintJson: normalizeProjectBlueprintValue(payload.blueprintJson),
    renderMode: normalizeRenderMode(payload.renderMode),
  };
};

const toFirestoreErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "Permission denied while accessing projects. Check Firestore rules and ensure you are signed in.";
      case "unauthenticated":
        return "You are not authenticated for Firestore access. Sign in again and retry.";
      case "not-found":
        return "Firestore database or document path not found for this project.";
      case "failed-precondition":
        return "Firestore is not fully configured for this project yet.";
      case "unavailable":
        return "Firestore is temporarily unavailable. Please retry in a moment.";
      default:
        return `Firestore error (${error.code}): ${error.message}`;
    }
  }

  return `Unexpected Firestore error: ${String(error)}`;
};

export const listProjects = async (userId: string): Promise<BlueprintProject[]> => {
  try {
    const q = query(userProjectsRef(userId), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => normalizeProject(userId, d.id, d.data()));
  } catch (error) {
    throw new Error(toFirestoreErrorMessage(error));
  }
};

export const saveProject = async (
  userId: string,
  project: Omit<BlueprintProject, "id" | "createdAt" | "updatedAt" | "userId"> & { id?: string },
): Promise<string> => {
  try {
    const { id, ...projectData } = project;
    const normalizedProjectData = normalizeProjectForSave(projectData);
    const sanitizedProjectData = removeUndefinedFields(normalizedProjectData);

    if (id) {
      const ref = doc(db, "users", userId, "projects", id);
      await setDoc(
        ref,
        {
          ...sanitizedProjectData,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      return id;
    }

    const docRef = await addDoc(userProjectsRef(userId), {
      ...sanitizedProjectData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw new Error(toFirestoreErrorMessage(error));
  }
};

export const getProject = async (userId: string, projectId: string): Promise<BlueprintProject | null> => {
  try {
    const ref = doc(db, "users", userId, "projects", projectId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return null;
    }

    return normalizeProject(userId, snapshot.id, snapshot.data());
  } catch (error) {
    throw new Error(toFirestoreErrorMessage(error));
  }
};

export const removeProject = async (userId: string, projectId: string): Promise<void> => {
  try {
    const ref = doc(db, "users", userId, "projects", projectId);
    await deleteDoc(ref);
  } catch (error) {
    throw new Error(toFirestoreErrorMessage(error));
  }
};
