import { useEffect, useMemo, useState } from "react";
import EnvironmentalMonitoring from "./components/EnvironmentalMonitoring";
import {
  loginUser,
  registerUser,
  getProjects,
  getSites,
  createProject,
} from "./api";

import MapView from "./components/MapView";
import MonitoringSites from "./components/MonitoringSites";
import Projects from "./components/Projects";
import "./App.css";


function App() {
  // =====================================================
  // AUTHENTICATION STATE
  // =====================================================

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("darukaa_token"))
  );


  // =====================================================
  // DASHBOARD STATE
  // =====================================================

  const [activePage, setActivePage] = useState("Dashboard");

  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);

  const [showProjectForm, setShowProjectForm] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectLocation, setProjectLocation] = useState("");

  const [searchTerm, setSearchTerm] = useState("");


  // =====================================================
  // LOAD PROJECTS + SITES
  // =====================================================

  async function loadDashboardData() {
    try {
      const [projectData, siteData] = await Promise.all([
        getProjects(),
        getSites(),
      ]);

      setProjects(projectData);
      setSites(siteData);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    }
  }


  useEffect(() => {
    if (loggedIn) {
      loadDashboardData();
    }
  }, [loggedIn]);


  // =====================================================
  // LOGIN / REGISTER
  // =====================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const result = await registerUser({
          name,
          email,
          password,
        });

        setMessage(
          `Registration successful! Welcome, ${result.name}.`
        );

        setMode("login");

        setName("");
        setPassword("");
      } else {
        const result = await loginUser({
          email,
          password,
        });

        localStorage.setItem(
          "darukaa_token",
          result.access_token
        );

        setLoggedIn(true);
        setActivePage("Dashboard");

        setMessage("Login successful!");
        setPassword("");

        await loadDashboardData();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // CREATE PROJECT
  // =====================================================

  async function handleCreateProject(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
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

      setShowProjectForm(false);

      setMessage("Project created successfully!");
    } catch (err) {
      setError(err.message || "Project creation failed.");
    }
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem("darukaa_token");

    setLoggedIn(false);

    setProjects([]);
    setSites([]);

    setMessage("");
    setError("");

    setActivePage("Dashboard");
  }


  // =====================================================
  // PROJECT SEARCH
  // =====================================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);


  // =====================================================
  // LOGIN / REGISTER PAGE
  // =====================================================

  if (!loggedIn) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-brand">

            <div className="auth-logo">
              🌍
            </div>

            <h1>
              Darukaa.Earth
            </h1>

            <p>
              Smart environmental monitoring and
              sustainable project management.
            </p>

          </div>


          <div className="auth-tabs">

            <button
              type="button"
              className={
                mode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("login");
                setMessage("");
                setError("");
              }}
            >
              Login
            </button>


            <button
              type="button"
              className={
                mode === "register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("register");
                setMessage("");
                setError("");
              }}
            >
              Register
            </button>

          </div>


          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            {mode === "register" && (
              <div className="form-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>
            )}


            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>


            <div className="form-field">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>


            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>

          </form>


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


          <div className="auth-footer">
            Building a greener and smarter Earth 🌱
          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            🌿
          </div>

          <div>

            <h1>
              Darukaa.Earth
            </h1>

            <span>
              For a greener tomorrow
            </span>

          </div>

        </div>


        <nav className="sidebar-nav">

          {[
            {
              label: "Dashboard",
              icon: "⌂",
            },
            {
              label: "Projects",
              icon: "▣",
            },
            {
              label: "Monitoring Sites",
              icon: "⌖",
            },
            {
              label: "Map View",
              icon: "▱",
            },
            {
              label: "Analytics",
              icon: "◔",
            },
            
          ].map((item) => (

            <button
              key={item.label}
              className={
                activePage === item.label
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActivePage(item.label);
                setMessage("");
                setError("");
              }}
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          ))}

        </nav>


        <div className="sidebar-quote">

          <div>
            🌱
          </div>

          <p>
            “Small actions create a greener planet.”
          </p>

        </div>

      </aside>


      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="main-area">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="topbar">

          <div className="mobile-brand">

            <span>
              🌿
            </span>

            <strong>
              Darukaa.Earth
            </strong>

          </div>


          <div className="topbar-actions">

            <button
              type="button"
              className="icon-button"
              title="Notifications"
            >
              ♡
            </button>


            <div className="user-profile">

              <div className="avatar">
                P
              </div>


              <div className="user-info">

                <strong>
                  Pavitra Badiger
                </strong>

                <span>
                  Environmental User
                </span>

              </div>


              <span className="dropdown-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="dashboard-content">


          {/* =================================================
              DASHBOARD PAGE
          ================================================= */}

          {activePage === "Dashboard" && (
            <>

              {/* Welcome */}
              <section className="welcome-banner">

                <div className="welcome-content">

                  <span className="welcome-label">
                    WELCOME BACK,
                  </span>

                  <h2>
                    Pavitra!
                  </h2>

                  <p>
                    Manage environmental projects and
                    monitoring sites from one place.
                  </p>

                </div>


                <div className="welcome-visual">

                  <div className="sun"></div>

                  <div className="mountain mountain-one"></div>

                  <div className="mountain mountain-two"></div>

                  <div className="lake"></div>

                  <div className="tree tree-one">
                    🌲
                  </div>

                  <div className="tree tree-two">
                    🌲
                  </div>

                </div>


                <div className="welcome-message">

                  <strong>
                    A cleaner environment
                    <br />
                    leads to a brighter
                    <br />
                    future.
                  </strong>

                  <span>
                    🌱
                  </span>

                </div>

              </section>


              {/* Messages */}

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


              {/* Statistics */}

              <section className="stats-grid">


                <div className="stat-card">

                  <div className="stat-icon green">
                    ▢
                  </div>

                  <div>

                    <span className="stat-title">
                      Projects
                    </span>

                    <strong>
                      {projects.length}
                    </strong>

                    <p>
                      Total environmental projects
                    </p>

                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-icon blue">
                    ⌖
                  </div>

                  <div>

                    <span className="stat-title">
                      Monitoring Sites
                    </span>

                    <strong>
                      {sites.length}
                    </strong>

                    <p>
                      Active monitoring locations
                    </p>

                  </div>

                </div>


                <div className="stat-card">

                  <div className="stat-icon light-green">
                    🌱
                  </div>

                  <div>

                    <span className="stat-title">
                      Environmental Status
                    </span>

                    <strong className="status-text">
                      Monitoring
                    </strong>

                    <p>
                      Keep tracking for impact
                    </p>

                  </div>

                </div>


              </section>


              {/* Projects */}

              <section className="projects-panel">

                <div className="projects-top">

                  <div>

                    <h2>
                      Projects
                    </h2>

                    <p>
                      Create and manage your environmental
                      projects
                    </p>

                  </div>


                  <button
                    className="add-project-button"
                    onClick={() => {
                      setShowProjectForm(
                        !showProjectForm
                      );

                      setMessage("");
                      setError("");
                    }}
                  >
                    <span>
                      +
                    </span>

                    Add Project
                  </button>

                </div>


                {/* Search */}

                <div className="project-toolbar">

                  <div className="search-box">

                    <span>
                      ⌕
                    </span>

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


                {/* Create Project Form */}

                {showProjectForm && (

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
                          setShowProjectForm(false)
                        }
                      >
                        Cancel
                      </button>


                      <button
                        type="submit"
                        className="add-project-button"
                      >
                        Create Project
                      </button>

                    </div>

                  </form>
                )}


                {/* Project List */}

                {filteredProjects.length === 0 ? (

                  <div className="empty-projects">

                    <div className="empty-icon">
                      ▢
                    </div>

                    <h3>
                      No projects yet
                    </h3>

                    <p>
                      Start by creating your first
                      environmental project.
                    </p>


                    {!showProjectForm && (

                      <button
                        className="add-project-button empty-add-button"
                        onClick={() =>
                          setShowProjectForm(true)
                        }
                      >

                        <span>
                          +
                        </span>

                        Add Your First Project

                      </button>

                    )}

                  </div>

                ) : (

                  <div className="projects-list">

                    {filteredProjects.map(
                      (project) => (

                        <div
                          key={project.id}
                          className="project-item"
                        >

                          <div className="project-item-icon">
                            🌿
                          </div>


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


                          <span className="project-status">
                            {project.status}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            </>
          )}
{/* =================================================
    PROJECTS
================================================= */}

{activePage === "Projects" && (
  <Projects />
)}


          {/* =================================================
              MAP VIEW
          ================================================= */}

          {activePage === "Map View" && (
            <MapView />
          )}

{/* =================================================
    MONITORING SITES
================================================= */}

{activePage === "Monitoring Sites" && (
  <MonitoringSites
    onAddSite={() => setActivePage("Map View")}
  />
)}


{/* =================================================
    ENVIRONMENTAL MONITORING
================================================= */}

{activePage === "Analytics" && (
  <EnvironmentalMonitoring />
)}

{/* =================================================
    OTHER PAGES
================================================= */}

{activePage !== "Dashboard" &&
   activePage !== "Projects" &&
  activePage !== "Map View" &&
  activePage !== "Monitoring Sites" &&
  activePage !== "Analytics" && (
    <section className="coming-soon">

      <div className="coming-icon">
        🌱
      </div>

      <h2>
        {activePage}
      </h2>

      <p>
        This section is ready for the next
        stage of Darukaa.Earth.
      </p>

      <button
        className="add-project-button"
        onClick={() =>
          setActivePage("Dashboard")
        }
      >
        Back to Dashboard
      </button>

    </section>
  )}

        </main>
      </div>
    </div>
  );
}

export default App;
