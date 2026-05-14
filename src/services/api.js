// API Service Layer - Connected to PostgreSQL Backend
// Falls back to localStorage if backend is unavailable

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STORAGE_KEYS = {
  LEADS: '360cleaning_leads',
  JOBS: '360cleaning_jobs',
  AUTH: '360cleaning_auth',
  ADMIN: '360cleaning_admin'
};

// Get auth token from localStorage
const getToken = () => {
  const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (auth) {
    const session = JSON.parse(auth);
    return session.token;
  }
  return null;
};

// Generic API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// Initialize demo data for demo mode
export const initializeDemoData = () => {
  // Set default admin credentials if not set
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    const admin = {
      username: "admin",
      password: "360cleaning2026"
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
  }
};

// ============ LEADS API (Connected to Backend) ============

export const getLeads = async () => {
  try {
    return await apiRequest('/api/leads');
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for leads');
    const leads = localStorage.getItem(STORAGE_KEYS.LEADS);
    return leads ? JSON.parse(leads) : [];
  }
};

export const addLead = async (lead) => {
  try {
    return await apiRequest('/api/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for addLead');
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const newLead = {
      id: Date.now(),
      ...lead,
      createdAt: new Date().toISOString(),
      status: "New"
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return newLead;
  }
};

export const updateLeadStatus = async (id, status) => {
  try {
    // First get the lead to update all fields
    const leads = await getLeads();
    const lead = leads.find(l => l.id === id || l.id === parseInt(id));
    if (lead) {
      return await apiRequest(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...lead, status }),
      });
    }
    return null;
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for updateLeadStatus');
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const index = leads.findIndex(l => l.id === id || l.id === parseInt(id));
    if (index !== -1) {
      leads[index].status = status;
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      return leads[index];
    }
    return null;
  }
};

export const deleteLead = async (id) => {
  try {
    await apiRequest(`/api/leads/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for deleteLead');
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const filtered = leads.filter(l => l.id !== id && l.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filtered));
    return true;
  }
};

// ============ JOBS API (Connected to Backend) ============

export const getJobs = async () => {
  try {
    return await apiRequest('/api/jobs');
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for jobs');
    const jobs = localStorage.getItem(STORAGE_KEYS.JOBS);
    return jobs ? JSON.parse(jobs) : [];
  }
};

export const addJob = async (job) => {
  try {
    return await apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for addJob');
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const newJob = {
      id: Date.now(),
      ...job,
      status: "Pending"
    };
    jobs.unshift(newJob);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return newJob;
  }
};

export const updateJob = async (id, updates) => {
  try {
    // First get the job to update all fields
    const jobs = await getJobs();
    const job = jobs.find(j => j.id === id || j.id === parseInt(id));
    if (job) {
      return await apiRequest(`/api/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...job, ...updates }),
      });
    }
    return null;
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for updateJob');
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const index = jobs.findIndex(j => j.id === id || j.id === parseInt(id));
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return jobs[index];
    }
    return null;
  }
};

export const deleteJob = async (id) => {
  try {
    await apiRequest(`/api/jobs/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for deleteJob');
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const filtered = jobs.filter(j => j.id !== id && j.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
    return true;
  }
};

// ============ AUTH API (Connected to Backend) ============

export const login = async (username, password) => {
  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (result.success) {
      const session = {
        isAuthenticated: true,
        username: result.user.username,
        token: result.token,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      return { success: true, user: result.user };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for login');
    const admin = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || '{}');
    if (admin.username === username && admin.password === password) {
      const session = {
        isAuthenticated: true,
        username,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      return { success: true, user: { username } };
    }
    return { success: false, error: "Invalid credentials" };
  }
};

export const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  return { success: true };
};

export const checkAuth = () => {
  const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (auth) {
    const session = JSON.parse(auth);
    return session.isAuthenticated ? session : null;
  }
  return null;
};

// ============ STATS API (Connected to Backend) ============

export const getStats = async () => {
  try {
    return await apiRequest('/api/stats');
  } catch (error) {
    // Fallback to localStorage if backend is unavailable
    console.log('Backend unavailable, using localStorage for stats');
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]');
    const newLeads = leads.filter(l => l.status === "New").length;
    const bookedJobs = jobs.filter(j => j.status === "Confirmed" || j.status === "Scheduled").length;
    const completedJobs = jobs.filter(j => j.status === "Completed").length;
    
    return {
      newLeads,
      bookedJobs,
      totalJobs: jobs.length,
      completedJobs,
      totalLeads: leads.length,
      completionRate: jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0
    };
  }
};
