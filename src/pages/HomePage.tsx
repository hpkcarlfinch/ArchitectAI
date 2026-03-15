import { ErrorBanner } from "../components/ErrorBanner";
import { useApp } from "../hooks/useAppContext";
import { AuthControls } from "../features/auth/AuthControls";
import { ProjectControls } from "../features/projects/ProjectControls";
import { ChatPanel } from "../features/chat/ChatPanel";
import { RenderPanel } from "../features/blueprint/RenderPanel";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const HomePage = () => {
  const { errorMessage, clearError, isGenerating } = useApp();

  return (
    <div className="app-shell">
      {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={clearError} /> : null}

      <aside className="left-column">
        <header className="app-header card">
          <h1>ArchitectAI</h1>
          <p className="muted">AI-powered house blueprint generation</p>
        </header>
        <AuthControls />
        <ProjectControls />
        <ChatPanel />
      </aside>

      <main className="right-column">
        {isGenerating ? <LoadingSpinner label="Generating blueprint from chat..." /> : null}
        <RenderPanel />
      </main>
    </div>
  );
};
