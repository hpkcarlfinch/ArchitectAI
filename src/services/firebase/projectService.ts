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
import { db } from "./firebaseClient";

const userProjectsRef = (userId: string) => collection(db, "users", userId, "projects");

const removeUndefinedFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
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

    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BlueprintProject, "id">) }));
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
    const sanitizedProjectData = removeUndefinedFields(projectData);

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

    return { id: snapshot.id, ...(snapshot.data() as Omit<BlueprintProject, "id">) };
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
