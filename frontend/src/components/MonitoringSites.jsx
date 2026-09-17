import { useEffect, useMemo, useState } from "react";
import { getProjects, getSites } from "../api";

function MonitoringSites({ onAddSite }) {
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [siteData, projectData] = await Promise.all([
          getSites(),
          getProjects(),
        ]);

        setSites(siteData);
        setProjects(projectData);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load monitoring sites.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getProjectName(projectId) {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project ? project.name : "Unknown project";
  }

  const filteredSites = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return sites;
    }

    return sites.filter((site) => {
      const projectName = getProjectName(site.project_id);

      return (
        site.name.toLowerCase().includes(search) ||
        projectName.toLowerCase().includes(search) ||
        String(site.latitude).includes(search) ||
        String(site.longitude).includes(search)
      );
    });
  }, [sites, projects, searchTerm]);

  return (
    <div className="monitoring-page">

      <div className="monitoring-header">
        <div>
          <h2>Monitoring Sites</h2>

          <p>
            Manage environmental monitoring locations
            across your projects.
          </p>
        </div>

        <button
          className="add-project-button"
          onClick={onAddSite}
        >
          <span>+</span>
          Add Monitoring Site
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="monitoring-toolbar">

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

        <div className="site-total">
          <strong>{sites.length}</strong>
          <span>
            {sites.length === 1
              ? " monitoring site"
              : " monitoring sites"}
          </span>
        </div>

      </div>

      <div className="monitoring-panel">

        {loading ? (
          <div className="monitoring-empty">
            <div className="empty-icon">⏳</div>
            <h3>Loading monitoring sites...</h3>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="monitoring-empty">

            <div className="empty-icon">
              📍
            </div>

            <h3>
              {sites.length === 0
                ? "No monitoring sites yet"
                : "No matching sites"}
            </h3>

            <p>
              {sites.length === 0
                ? "Add your first monitoring location from the map."
                : "Try a different search term."}
            </p>

            {sites.length === 0 && (
              <button
                className="add-project-button"
                onClick={onAddSite}
              >
                <span>+</span>
                Add Your First Site
              </button>
            )}

          </div>
        ) : (
          <div className="sites-table-wrapper">

            <table className="sites-table">

              <thead>
                <tr>
                  <th>Site</th>
                  <th>Project</th>
                  <th>Area</th>
                  <th>Coordinates</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {filteredSites.map((site) => (
                  <tr key={site.id}>

                    <td>
                      <div className="site-name-cell">
                        <div className="site-row-icon">
                          📍
                        </div>

                        <strong>
                          {site.name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      {getProjectName(site.project_id)}
                    </td>

                    <td>
                      {site.area_hectares} ha
                    </td>

                    <td>
                      <div className="coordinates">
                        <span>
                          {Number(site.latitude).toFixed(5)}
                        </span>

                        <span>
                          {Number(site.longitude).toFixed(5)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="description-cell">
                        {site.description ||
                          "No description"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default MonitoringSites;