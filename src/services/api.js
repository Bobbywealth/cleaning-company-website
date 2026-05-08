// LocalStorage API Service Layer
// This simulates backend operations - ready to swap with real API later

const STORAGE_KEYS = {
  LEADS: '360cleaning_leads',
  JOBS: '360cleaning_jobs',
  AUTH: '360cleaning_auth',
  ADMIN: '360cleaning_admin'
};

// Initialize with demo data if empty
export const initializeDemoData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    const demoJobs = [
      { id: 1, client: "Johnson Residence", service: "Deep Clean", date: "Today, 10:00 AM", status: "Confirmed", phone: "(555) 123-4567", email: "johnson@email.com" },
      { id: 2, client: "Bright Dental Office", service: "Commercial", date: "Today, 7:00 PM", status: "Scheduled", phone: "(555) 234-5678", email: "brightdental@office.com" },
      { id: 3, client: "Miller Apartment", service: "Move-Out", date: "Tomorrow, 1:30 PM", status: "Pending", phone: "(555) 345-6789", email: "miller@email.com" }
    ];
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(demoJobs));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
    const demoLeads = [
      { id: 1, name: "Sarah Johnson", phone: "(555) 111-2222", email: "sarah.j@email.com", service: "Deep Cleaning", notes: "3 bedroom house, need carpet cleaning too", createdAt: new Date().toISOString(), status: "New" },
      { id: 2, name: "Mike Chen", phone: "(555) 222-3333", email: "mchen@business.com", service: "Commercial Cleaning", notes: "Office building, 5000 sqft, need daily service", createdAt: new Date(Date.now() - 86400000).toISOString(), status: "Contacted" }
    ];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(demoLeads));
  }
  
  // Set default admin credentials
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    const admin = {
      username: "admin",
      password: "360cleaning2026"
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
  }
};

// ============ LEADS API ============

export const getLeads = () => {
  const leads = localStorage.getItem(STORAGE_KEYS.LEADS);
  return leads ? JSON.parse(leads) : [];
};

export const addLead = (lead) => {
  const leads = getLeads();
  const newLead = {
    id: Date.now(),
    ...lead,
    createdAt: new Date().toISOString(),
    status: "New"
  };
  leads.unshift(newLead);
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  return newLead;
};

export const updateLeadStatus = (id, status) => {
  const leads = getLeads();
  const index = leads.findIndex(l => l.id === id);
  if (index !== -1) {
    leads[index].status = status;
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return leads[index];
  }
  return null;
};

export const deleteLead = (id) => {
  const leads = getLeads();
  const filtered = leads.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filtered));
  return true;
};

// ============ JOBS API ============

export const getJobs = () => {
  const jobs = localStorage.getItem(STORAGE_KEYS.JOBS);
  return jobs ? JSON.parse(jobs) : [];
};

export const addJob = (job) => {
  const jobs = getJobs();
  const newJob = {
    id: Date.now(),
    ...job,
    status: "Pending"
  };
  jobs.unshift(newJob);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  return newJob;
};

export const updateJob = (id, updates) => {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return jobs[index];
  }
  return null;
};

export const deleteJob = (id) => {
  const jobs = getJobs();
  const filtered = jobs.filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
  return true;
};

// ============ AUTH API ============

export const login = (username, password) => {
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
};

export const logout = () => {
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

// ============ STATS API ============

export const getStats = () => {
  const leads = getLeads();
  const jobs = getJobs();
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
};
