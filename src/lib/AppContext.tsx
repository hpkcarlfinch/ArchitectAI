/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "firebase/auth";
import { createEmptyProject } from "./projectFactory";
import { subscribeAuth, signInWithGoogle, signOutUser } from "../services/firebase/authService";
import {
  getProject,
  listProjects,
  removeProject,
  saveProject,
} from "../services/firebase/projectService";
import { generateBlueprint } from "../services/openai/blueprintApi";
import { validateBlueprint } from "../services/blueprint/validate";
import { fallbackBlueprint } from "../services/blueprint/defaults";
import type { RenderMode } from "../types/blueprint";
import type { ChatMessage } from "../types/chat";
import type { BlueprintProject } from "../types/project";
import { makeId } from "../utils/id";

interface AppContextValue {
  user: User | null;
  authLoading: boolean;
  projects: BlueprintProject[];
  currentProject: BlueprintProject;
  isGenerating: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  newProject: () => void;
  loadProjectById: (projectId: string) => Promise<void>;
  deleteProjectById: (projectId: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
  setRenderMode: (mode: RenderMode) => void;
  setProjectTitle: (title: string) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE || "true") === "true";

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<BlueprintProject[]>([]);
  const [currentProject, setCurrentProject] = useState<BlueprintProject>(createEmptyProject());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshProjects = useCallback(async (uid: string) => {
    const items = await listProjects(uid);
    setProjects(items);
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(async (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);

      if (nextUser) {
        try {
          await refreshProjects(nextUser.uid);
          setCurrentProject((prev) => ({ ...prev, userId: nextUser.uid }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Could not load your saved projects.";
          setErrorMessage(message);
        }
      } else {
        setProjects([]);
        setCurrentProject(createEmptyProject());
      }
    });

    return () => unsub();
  }, [refreshProjects]);

  const signIn = useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch {
      setErrorMessage("Google sign-in failed. Please try again.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const newProject = useCallback(() => {
    const next = createEmptyProject(user?.uid ?? "demo-user", currentProject.renderMode);
    setCurrentProject(next);
  }, [currentProject.renderMode, user?.uid]);

  const saveCurrentProject = useCallback(async () => {
    if (!user) {
      if (DEMO_MODE) {
        setErrorMessage("Demo mode active. Sign in to persist projects.");
        return;
      }
      setErrorMessage("Please sign in to save projects.");
      return;
    }

    setIsSaving(true);
    try {
      const id = await saveProject(user.uid, {
        id: currentProject.id.startsWith("project_") ? undefined : currentProject.id,
        title: currentProject.title,
        description: currentProject.description,
        chatHistory: currentProject.chatHistory,
        blueprintJson: currentProject.blueprintJson,
        renderMode: currentProject.renderMode,
      });

      const updated = { ...currentProject, id, userId: user.uid, updatedAt: new Date().toISOString() };
      setCurrentProject(updated);
      await refreshProjects(user.uid);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save project.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }, [currentProject, refreshProjects, user]);

  const loadProjectById = useCallback(
    async (projectId: string) => {
      if (!user) {
        setErrorMessage("Sign in required to load saved projects.");
        return;
      }

      try {
        const project = await getProject(user.uid, projectId);
        if (!project) {
          setErrorMessage("Project not found.");
          return;
        }
        setCurrentProject(project);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not load project.";
        setErrorMessage(message);
      }
    },
    [user],
  );

  const deleteProjectById = useCallback(
    async (projectId: string) => {
      if (!user) {
        return;
      }

      try {
        await removeProject(user.uid, projectId);
        await refreshProjects(user.uid);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not delete project.";
        setErrorMessage(message);
      }
    },
    [refreshProjects, user],
  );

  const sendChatMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: makeId("msg"),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const nextHistory = [...currentProject.chatHistory, userMessage];
      setCurrentProject((prev) => ({ ...prev, chatHistory: nextHistory }));
      setIsGenerating(true);

      try {
        const response = await generateBlueprint({
          message: content,
          projectTitle: currentProject.title,
          chatHistory: nextHistory.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
        });

        const assistantMessage: ChatMessage = {
          id: makeId("msg"),
          role: "assistant",
          content: response.assistantMessage,
          createdAt: new Date().toISOString(),
        };

        setCurrentProject((prev) => {
          const mergedHistory = [...prev.chatHistory, assistantMessage];
          if (!response.blueprint) {
            return {
              ...prev,
              description: response.assistantMessage,
              chatHistory: mergedHistory,
              updatedAt: new Date().toISOString(),
            };
          }

          let blueprint;
          try {
            blueprint = validateBlueprint(response.blueprint);
          } catch {
            setErrorMessage("AI returned malformed data. Loaded fallback blueprint so you can keep editing.");
            blueprint = fallbackBlueprint;
          }

          return {
            ...prev,
            title: blueprint.metadata.title || prev.title,
            description: blueprint.metadata.description || prev.description,
            blueprintJson: blueprint,
            chatHistory: mergedHistory,
            updatedAt: new Date().toISOString(),
          };
        });
      } catch (error) {
        const assistantMessage: ChatMessage = {
          id: makeId("msg"),
          role: "assistant",
          content: "I hit an error while generating the plan. Please try again or simplify your request.",
          createdAt: new Date().toISOString(),
        };
        setCurrentProject((prev) => ({
          ...prev,
          chatHistory: [...prev.chatHistory, assistantMessage],
          updatedAt: new Date().toISOString(),
        }));
        const message = error instanceof Error ? error.message : "Unknown generation failure.";
        setErrorMessage(`Generation failed. ${message}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [currentProject.chatHistory, currentProject.title],
  );

  const setRenderMode = useCallback((mode: RenderMode) => {
    setCurrentProject((prev) => ({ ...prev, renderMode: mode, updatedAt: new Date().toISOString() }));
  }, []);

  const setProjectTitle = useCallback((title: string) => {
    setCurrentProject((prev) => ({ ...prev, title, updatedAt: new Date().toISOString() }));
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      authLoading,
      projects,
      currentProject,
      isGenerating,
      isSaving,
      errorMessage,
      signIn,
      signOut,
      newProject,
      loadProjectById,
      deleteProjectById,
      saveCurrentProject,
      sendChatMessage,
      setRenderMode,
      setProjectTitle,
      clearError,
    }),
    [
      authLoading,
      clearError,
      currentProject,
      deleteProjectById,
      errorMessage,
      isGenerating,
      isSaving,
      loadProjectById,
      newProject,
      projects,
      saveCurrentProject,
      sendChatMessage,
      setProjectTitle,
      setRenderMode,
      signIn,
      signOut,
      user,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};
