const API_BASE_URL = "http://127.0.0.1:8000";


// =====================================================
// REGISTER USER
// =====================================================

export async function registerUser(userData) {
  const response = await fetch(
    `${API_BASE_URL}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(userData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Registration failed"
    );
  }

  return data;
}


// =====================================================
// LOGIN USER
// =====================================================

export async function loginUser(loginData) {
  const response = await fetch(
    `${API_BASE_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(loginData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  return data;
}


// =====================================================
// GET ALL PROJECTS
// =====================================================

export async function getProjects() {
  const response = await fetch(
    `${API_BASE_URL}/projects`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to fetch projects"
    );
  }

  return data;
}


// =====================================================
// CREATE PROJECT
// =====================================================

export async function createProject(projectData) {
  const response = await fetch(
    `${API_BASE_URL}/projects`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(projectData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Project creation failed"
    );
  }

  return data;
}


// =====================================================
// GET ALL MONITORING SITES
// =====================================================

export async function getSites() {
  const response = await fetch(
    `${API_BASE_URL}/sites`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to fetch sites"
    );
  }

  return data;
}


// =====================================================
// CREATE MONITORING SITE
// =====================================================

export async function createSite(siteData) {
  const response = await fetch(
    `${API_BASE_URL}/sites`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(siteData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Site creation failed"
    );
  }

  return data;
}


// =====================================================
// UPDATE MONITORING SITE
// =====================================================

export async function updateSite(siteId, siteData) {
  const response = await fetch(
    `${API_BASE_URL}/sites/${siteId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(siteData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to update monitoring site."
    );
  }

  return data;
}


// =====================================================
// DELETE MONITORING SITE
// =====================================================

export async function deleteSite(siteId) {
  const response = await fetch(
    `${API_BASE_URL}/sites/${siteId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to delete monitoring site."
    );
  }

  return data;
}


// =====================================================
// FETCH LATEST WEATHER
// =====================================================

export async function fetchSiteWeather(siteId) {
  const response = await fetch(
    `${API_BASE_URL}/sites/${siteId}/fetch-weather`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to fetch environmental data"
    );
  }

  return data;
}


// =====================================================
// GET ENVIRONMENTAL READINGS
// =====================================================

export async function getSiteReadings(siteId) {
  const response = await fetch(
    `${API_BASE_URL}/sites/${siteId}/readings`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to fetch environmental readings"
    );
  }

  return data;
}


// =====================================================
// GET BIODIVERSITY DATA
// =====================================================

export async function getSiteBiodiversity(siteId) {
  const response = await fetch(
    `${API_BASE_URL}/sites/${siteId}/biodiversity`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to fetch biodiversity data."
    );
  }

  return data;
}
// =====================================================
// DELETE PROJECT
// =====================================================

export async function deleteProject(projectId) {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to delete project."
    );
  }

  return data;
}