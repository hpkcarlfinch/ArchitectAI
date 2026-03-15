import { useMemo } from "react";
import { useApp } from "../../hooks/useAppContext";

export const ProjectControls = () => {
  const {
    user,
    projects,
    currentProject,
    newProject,
    saveCurrentProject,
    loadProjectById,
    deleteProjectById,
    isSaving,
    setProjectTitle,
  } = useApp();

  const canSave = useMemo(() => Boolean(user), [user]);

  return (
    <section className="card section-gap">
      <h2>Project</h2>
      <label className="field-label" htmlFor="projectTitle">
        Title
      </label>
      <input
        id="projectTitle"
        className="input"
        type="text"
        value={currentProject.title}
        onChange={(event) => setProjectTitle(event.target.value)}
      />

      <div className="row gap-sm">
        <button className="button" type="button" onClick={newProject}>
          New
        </button>
        <button className="button" type="button" onClick={saveCurrentProject} disabled={!canSave || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <h3 className="subheading">Saved Projects</h3>
      {!user ? <p className="muted">Sign in to view saved projects.</p> : null}
      {user && projects.length === 0 ? <p className="muted">No saved projects yet.</p> : null}

      {user && projects.length > 0 ? (
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.id}>
              <button className="list-button" type="button" onClick={() => loadProjectById(project.id)}>
                <strong>{project.title}</strong>
                <span className="muted small">{new Date(project.updatedAt).toLocaleString()}</span>
              </button>
              <button
                className="button danger"
                type="button"
                onClick={() => deleteProjectById(project.id)}
                aria-label={`Delete ${project.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}