const API_BASE_URL = "http://127.0.0.1:8000";

// -----------------------------------------
// Register User
// -----------------------------------------
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}


// -----------------------------------------
// Login User
// -----------------------------------------
export async function loginUser(loginData) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}


// -----------------------------------------
// Get All Projects
// -----------------------------------------
export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw new Error("Unable to fetch projects");
  }

  return await response.json();
}


// -----------------------------------------
// Create Project
// -----------------------------------------
export async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Project creation failed");
  }

  return data;
}


// -----------------------------------------
// Get All Sites
// -----------------------------------------
export async function getSites() {
  const response = await fetch(`${API_BASE_URL}/sites`);

  if (!response.ok) {
    throw new Error("Unable to fetch sites");
  }

  return await response.json();
}


// -----------------------------------------
// Create Site
// -----------------------------------------
export async function createSite(siteData) {
  const response = await fetch(`${API_BASE_URL}/sites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(siteData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Site creation failed");
  }

  return data;
}