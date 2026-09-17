import { useEffect, useState } from "react";

import {
  getSites,
  getProjects,
  updateSite,
  deleteSite,
} from "../api";


function MonitoringSites({ onAddSite }) {
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // EDIT STATE
  // =====================================================

  const [editingSite, setEditingSite] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // =====================================================
  // DELETE STATE
  // =====================================================

  const [deletingSiteId, setDeletingSiteId] = useState(null);


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [siteData, projectData] = await Promise.all([
        getSites(),
        getProjects(),
      ]);

      setSites(siteData || []);
      setProjects(projectData || []);

    } catch (err) {
      setError(
        err.message || "Unable to load monitoring sites."
      );

    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // GET PROJECT NAME
  // =====================================================

  function getProjectName(projectId) {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project
      ? project.name
      : "No project assigned";
  }


  // =====================================================
  // FILTER SITES
  // =====================================================

  const filteredSites = sites.filter((site) =>
    site.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  function handleOpenEdit(site) {
    setEditingSite(site);
    setEditName(site.name || "");
    setEditDescription(site.description || "");
    setError("");
  }


  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  function handleCloseEdit() {
    if (savingEdit) {
      return;
    }

    setEditingSite(null);
    setEditName("");
    setEditDescription("");
  }


  // =====================================================
  // SAVE EDIT
  // =====================================================

  async function handleSaveEdit(event) {
    event.preventDefault();

    if (!editingSite) {
      return;
    }

    const trimmedName = editName.trim();

    if (!trimmedName) {
      setError("Site name cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updatedSite = await updateSite(
        editingSite.id,
        {
          name: trimmedName,
          description: editDescription,
        }
      );

      setSites((currentSites) =>
        currentSites.map((site) =>
          site.id === editingSite.id
            ? updatedSite
            : site
        )
      );

      handleCloseEdit();

    } catch (err) {
      setError(
        err.message ||
          "Unable to update monitoring site."
      );

    } finally {
      setSavingEdit(false);
    }
  }


  // =====================================================
  // DELETE SITE
  // =====================================================

  async function handleDeleteSite(site) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${site.name}"?\n\nThis will also remove the environmental readings associated with this site.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingSiteId(site.id);
      setError("");

      await deleteSite(site.id);

      setSites((currentSites) =>
        currentSites.filter(
          (item) => item.id !== site.id
        )
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to delete monitoring site."
      );

    } finally {
      setDeletingSiteId(null);
    }
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="monitoring-sites-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="projects-top">

        <div>
          <span className="welcome-label">
            MONITORING SITES
          </span>

          <h2>
            Environmental Monitoring Sites
          </h2>

          <p>
            Manage and monitor the locations connected
            to your environmental projects.
          </p>
        </div>


        <button
          type="button"
          className="add-project-button"
          onClick={onAddSite}
        >
          <span>+</span>
          Add Monitoring Site
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

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
            placeholder="Search monitoring sites..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="empty-projects">

          <div className="empty-icon">
            🌍
          </div>

          <h3>
            Loading monitoring sites...
          </h3>

          <p>
            Please wait while the sites are loaded.
          </p>

        </div>

      ) : filteredSites.length === 0 ? (

        /* =================================================
            EMPTY STATE
        ================================================= */

        <div className="empty-projects">

          <div className="empty-icon">
            📍
          </div>

          <h3>
            {searchTerm
              ? "No matching sites"
              : "No monitoring sites yet"}
          </h3>

          <p>
            {searchTerm
              ? "Try a different search term."
              : "Add a monitoring site using the map."}
          </p>


          {!searchTerm && (

            <button
              type="button"
              className="add-project-button empty-add-button"
              onClick={onAddSite}
            >
              <span>+</span>
              Add Your First Site
            </button>

          )}

        </div>

      ) : (

        /* =================================================
            SITES TABLE
        ================================================= */

        <div className="projects-panel">

          <div className="projects-top">

            <div>

              <h2>
                Monitoring Sites
              </h2>

              <p>
                {filteredSites.length} site
                {filteredSites.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </p>

            </div>

          </div>


          <div className="environment-table-wrapper">

            <table className="environment-table">

              <thead>

                <tr>

                  <th>
                    Site Name
                  </th>

                  <th>
                    Project
                  </th>

                  <th>
                    Area
                  </th>

                  <th>
                    Coordinates
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredSites.map((site) => (

                  <tr key={site.id}>

                    {/* Site Name */}

                    <td>
                      <strong>
                        {site.name}
                      </strong>
                    </td>


                    {/* Project */}

                    <td>
                      {getProjectName(
                        site.project_id
                      )}
                    </td>


                    {/* Area */}

                    <td>
                      {site.area_hectares !== null &&
                      site.area_hectares !== undefined
                        ? `${site.area_hectares} ha`
                        : "—"}
                    </td>


                    {/* Coordinates */}

                    <td>
                      {site.latitude},
                      {" "}
                      {site.longitude}
                    </td>


                    {/* Description */}

                    <td>
                      {site.description || "—"}
                    </td>


                    {/* Actions */}

                    <td>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >

                        {/* EDIT BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEdit(site)
                          }
                          disabled={
                            deletingSiteId ===
                            site.id
                          }
                          style={{
                            border: "1px solid #0b633f",
                            background: "#eef8f2",
                            color: "#0b633f",
                            borderRadius: "7px",
                            padding: "7px 12px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          ✏️ Edit
                        </button>


                        {/* DELETE BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSite(site)
                          }
                          disabled={
                            deletingSiteId ===
                            site.id
                          }
                          style={{
                            border: "1px solid #dc3545",
                            background: "#fff5f5",
                            color: "#dc3545",
                            borderRadius: "7px",
                            padding: "7px 12px",
                            cursor:
                              deletingSiteId ===
                              site.id
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600",
                            opacity:
                              deletingSiteId ===
                              site.id
                                ? 0.6
                                : 1,
                          }}
                        >
                          {deletingSiteId === site.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editingSite && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >

            {/* Modal Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "22px",
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    color: "#102a43",
                    fontSize: "24px",
                  }}
                >
                  Edit Monitoring Site
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color: "#667085",
                  }}
                >
                  Update the site information.
                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={savingEdit}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "28px",
                  color: "#667085",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>


            {/* Edit Form */}

            <form onSubmit={handleSaveEdit}>

              {/* Site Name */}

              <div className="form-field">

                <label>
                  Site Name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) =>
                    setEditName(
                      event.target.value
                    )
                  }
                  placeholder="Enter site name"
                  required
                />

              </div>


              {/* Description */}

              <div className="form-field">

                <label>
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe this monitoring site"
                  rows={4}
                />

              </div>


              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >

                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={savingEdit}
                  className="secondary-button"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={savingEdit}
                  className="add-project-button"
                >
                  {savingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </section>
  );
}


export default MonitoringSites;