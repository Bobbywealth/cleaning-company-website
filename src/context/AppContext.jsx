import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getLeads, 
  addLead, 
  updateLeadStatus, 
  deleteLead,
  getJobs, 
  addJob, 
  updateJob, 
  deleteJob,
  login as apiLogin,
  logout as apiLogout,
  checkAuth,
  getStats,
  initializeDemoData
} from '../services/api';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ newLeads: 0, bookedJobs: 0, totalJobs: 0, completedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Initialize data and check auth on mount
  useEffect(() => {
    initializeDemoData();
    checkAuthStatus();
    refreshData();
  }, []);

  const checkAuthStatus = () => {
    const auth = checkAuth();
    setUser(auth);
    setLoading(false);
  };

  const refreshData = () => {
    setLeads(getLeads());
    setJobs(getJobs());
    setStats(getStats());
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Auth functions
  const login = async (username, password) => {
    const result = apiLogin(username, password);
    if (result.success) {
      setUser({ username: result.user.username, isAuthenticated: true });
    }
    return result;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Lead functions
  const submitLead = (leadData) => {
    const newLead = addLead(leadData);
    refreshData();
    showNotification('Quote request submitted successfully!');
    return newLead;
  };

  const markLeadContacted = (id) => {
    updateLeadStatus(id, 'Contacted');
    refreshData();
    showNotification('Lead marked as contacted');
  };

  const markLeadConverted = (id) => {
    updateLeadStatus(id, 'Converted');
    refreshData();
    showNotification('Lead converted to customer!');
  };

  const removeLead = (id) => {
    deleteLead(id);
    refreshData();
    showNotification('Lead deleted');
  };

  // Job functions
  const createJob = (jobData) => {
    const newJob = addJob(jobData);
    refreshData();
    showNotification('Job created successfully!');
    return newJob;
  };

  const updateJobStatus = (id, status) => {
    updateJob(id, { status });
    refreshData();
    showNotification(`Job status updated to ${status}`);
  };

  const removeJob = (id) => {
    deleteJob(id);
    refreshData();
    showNotification('Job deleted');
  };

  const value = {
    user,
    isAuthenticated: !!user?.isAuthenticated,
    leads,
    jobs,
    stats,
    loading,
    notification,
    login,
    logout,
    submitLead,
    markLeadContacted,
    markLeadConverted,
    removeLead,
    createJob,
    updateJobStatus,
    removeJob,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
