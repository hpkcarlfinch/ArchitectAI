import { useApp } from "../../hooks/useAppContext";
import { Blueprint2DView } from "../render2d/Blueprint2DView";
import { Blueprint3DView } from "../render3d/Blueprint3DView";

export const RenderPanel = () => {
  const { currentProject, setRenderMode } = useApp();
  const is3D = currentProject.renderMode === "3d";

  return (
    <section className="render-panel">
      <header className="render-header">
        <div>
          <h2>{currentProject.title}</h2>
          <p className="muted">{currentProject.description}</p>
        </div>
        <label className="mode-toggle" htmlFor="renderModeToggle">
          <span className={`mode-chip ${is3D ? "is-3d" : "is-2d"}`}>Mode: {is3D ? "3D" : "2D"}</span>
          <span className="mode-label">2D</span>
          <input
            id="renderModeToggle"
            className="mode-toggle-input"
            type="checkbox"
            checked={is3D}
            onChange={(event) => setRenderMode(event.target.checked ? "3d" : "2d")}
            aria-label="Toggle 2D and 3D render mode"
          />
          <span className="mode-toggle-track" aria-hidden="true">
            <span className="mode-toggle-thumb" />
          </span>
          <span className="mode-label">3D</span>
        </label>
      </header>

      {currentProject.renderMode === "2d" ? (
        <Blueprint2DView blueprint={currentProject.blueprintJson} />
      ) : (
        <Blueprint3DView blueprint={currentProject.blueprintJson} />
      )}
    </section>
  );
};
