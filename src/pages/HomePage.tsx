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

      <header className="top-navbar card" role="banner">
        <div className="top-navbar-brand">
          <h1>ArchitectAI</h1>
          <p className="muted">AI-powered house blueprint generation</p>
        </div>
        <div className="top-navbar-auth">
          <AuthControls variant="navbar" />
        </div>
      </header>

      <aside className="left-column">
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
