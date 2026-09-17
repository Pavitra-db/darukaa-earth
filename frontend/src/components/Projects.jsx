import { useEffect, useMemo, useState } from "react";

import {
  getProjects,
  createProject,
  deleteProject,
} from "../api";


function Projects() {
  const [projects, setProjects] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectLocation, setProjectLocation] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingProjectId, setDeletingProjectId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  useEffect(() => {
    loadProjects();
  }, []);


  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const data = await getProjects();

      setProjects(data || []);

    } catch (err) {
      setError(
        err.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // CREATE PROJECT
  // =====================================================

  async function handleCreateProject(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const project = await createProject({
        name: projectName,
        description: projectDescription,
        location: projectLocation,
        status: "planned",
      });

      setProjects((previousProjects) => [
        project,
        ...previousProjects,
      ]);

      setProjectName("");
      setProjectDescription("");
      setProjectLocation("");

      setShowForm(false);

      setMessage(
        "Project created successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Project creation failed."
      );

    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // DELETE PROJECT
  // =====================================================

  async function handleDeleteProject(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis will also delete all monitoring sites and environmental readings belonging to this project.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(project.id);
      setError("");
      setMessage("");

      await deleteProject(project.id);

      setProjects((previousProjects) =>
        previousProjects.filter(
          (item) => item.id !== project.id
        )
      );

      setMessage(
        "Project deleted successfully."
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to delete project."
      );

    } finally {
      setDeletingProjectId(null);
    }
  }


  // =====================================================
  // FILTER PROJECTS
  // =====================================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);


  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="projects-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="projects-top">

        <div>

          <span className="welcome-label">
            PROJECT MANAGEMENT
          </span>

          <h2>
            Environmental Projects
          </h2>

          <p>
            Create and manage your environmental
            monitoring projects.
          </p>

        </div>


        <button
          type="button"
          className="add-project-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
            setError("");
          }}
        >
          <span>+</span>
          Add Project
        </button>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="project-toolbar">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>

      </div>


      {/* =================================================
          CREATE PROJECT FORM
      ================================================= */}

      {showForm && (

        <form
          className="project-form"
          onSubmit={handleCreateProject}
        >

          <div className="form-field">

            <label>
              Project Name
            </label>

            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(event) =>
                setProjectName(
                  event.target.value
                )
              }
              required
            />

          </div>


          <div className="form-field">

            <label>
              Description
            </label>

            <textarea
              placeholder="Describe your environmental project"
              value={projectDescription}
              onChange={(event) =>
                setProjectDescription(
                  event.target.value
                )
              }
            />

          </div>


          <div className="form-field">

            <label>
              Location
            </label>

            <input
              type="text"
              placeholder="Enter project location"
              value={projectLocation}
              onChange={(event) =>
                setProjectLocation(
                  event.target.value
                )
              }
            />

          </div>


          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowForm(false)
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="add-project-button"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Project"}
            </button>

          </div>

        </form>

      )}


      {/* =================================================
          PROJECT LIST
      ================================================= */}

      <div className="projects-panel">

        {loading ? (

          <div className="empty-projects">

            <div className="empty-icon">
              🌱
            </div>

            <h3>
              Loading projects...
            </h3>

            <p>
              Please wait while projects are loaded.
            </p>

          </div>

        ) : filteredProjects.length === 0 ? (

          <div className="empty-projects">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              {searchTerm
                ? "No matching projects"
                : "No projects yet"}
            </h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Create your first environmental project."}
            </p>


            {!searchTerm && (

              <button
                type="button"
                className="add-project-button empty-add-button"
                onClick={() =>
                  setShowForm(true)
                }
              >
                <span>+</span>
                Add Your First Project
              </button>

            )}

          </div>

        ) : (

          <div className="projects-list">

            {filteredProjects.map((project) => (

              <div
                key={project.id}
                className="project-item"
              >

                {/* Project Icon */}

                <div className="project-item-icon">
                  🌿
                </div>


                {/* Project Information */}

                <div className="project-item-info">

                  <h3>
                    {project.name}
                  </h3>

                  <p>
                    {project.description ||
                      "Environmental project"}
                  </p>


                  {project.location && (

                    <span>
                      📍 {project.location}
                    </span>

                  )}

                </div>


                {/* Status */}

                <span className="project-status">
                  {project.status || "planned"}
                </span>


                {/* Delete Button */}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteProject(project)
                  }
                  disabled={
                    deletingProjectId ===
                    project.id
                  }
                  style={{
                    border:
                      "1px solid #dc3545",
                    background:
                      "#fff5f5",
                    color:
                      "#dc3545",
                    borderRadius:
                      "7px",
                    padding:
                      "8px 12px",
                    cursor:
                      deletingProjectId ===
                      project.id
                        ? "not-allowed"
                        : "pointer",
                    fontWeight:
                      "600",
                    marginLeft:
                      "12px",
                    opacity:
                      deletingProjectId ===
                      project.id
                        ? 0.6
                        : 1,
                  }}
                >
                  {deletingProjectId ===
                  project.id
                    ? "Deleting..."
                    : "🗑️ Delete"}
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </section>
  );
}


export default Projects;