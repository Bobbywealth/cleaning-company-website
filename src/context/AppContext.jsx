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
  const [crewMembers, setCrewMembers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('crewMembers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [invoices, setInvoices] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('invoices');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [recurringClients, setRecurringClients] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recurringClients');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [stats, setStats] = useState({ newLeads: 0, bookedJobs: 0, totalJobs: 0, completedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [theme, setTheme] = useState(() => {
    // Check localStorage or default to dark
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboardTheme') || 'dark';
    }
    return 'dark';
  });

  // Initialize data and check auth on mount
  useEffect(() => {
    initializeDemoData();
    checkAuthStatus();
    refreshData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardTheme', theme);
      localStorage.setItem('crewMembers', JSON.stringify(crewMembers));
      localStorage.setItem('invoices', JSON.stringify(invoices));
      localStorage.setItem('recurringClients', JSON.stringify(recurringClients));
    }
  }, [theme, crewMembers, invoices, recurringClients]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const checkAuthStatus = () => {
    const auth = checkAuth();
    setUser(auth);
    setLoading(false);
  };

  const refreshData = async () => {
    const [leadsData, jobsData, statsData] = await Promise.all([
      getLeads(),
      getJobs(),
      getStats()
    ]);
    setLeads(leadsData);
    setJobs(jobsData);
    setStats(statsData);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Auth functions
  const login = async (username, password) => {
    const result = await apiLogin(username, password);
    if (result.success) {
      setUser({ username: result.user.username, isAuthenticated: true });
    }
    return result;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Lead functions - local state update for immediate UI feedback
  const addLead = (leadData) => {
    setLeads(prev => [leadData, ...prev]);
    return leadData;
  };

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

  // Crew functions
  const addCrewMember = (member) => {
    const newId = Math.max(...crewMembers.map(m => m.id), 0) + 1;
    setCrewMembers([...crewMembers, { ...member, id: newId }]);
    showNotification('Team member added!');
  };

  const updateCrewMember = (id, updates) => {
    setCrewMembers(crewMembers.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeCrewMember = (id) => {
    setCrewMembers(crewMembers.filter(m => m.id !== id));
    showNotification('Team member removed');
  };

  // Invoice functions
  const addInvoice = (invoice) => {
    const invoiceId = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    setInvoices([...invoices, {
      ...invoice,
      id: invoiceId,
      date: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'pending'
    }]);
    showNotification('Invoice created!');
  };

  const updateInvoiceStatus = (id, status) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
    showNotification(`Invoice marked as ${status}`);
  };

  const removeInvoice = (id) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
    showNotification('Invoice deleted');
  };

  // Recurring client functions
  const addRecurringClient = (client) => {
    const today = new Date();
    let nextDate = new Date(today);
    if (client.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (client.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);
    setRecurringClients([...recurringClients, {
      ...client,
      id: Date.now(),
      nextDate: nextDate.toISOString().split('T')[0],
      status: 'active'
    }]);
    showNotification('Recurring client added!');
  };

  const updateRecurringClient = (id, updates) => {
    setRecurringClients(recurringClients.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeRecurringClient = (id) => {
    setRecurringClients(recurringClients.filter(c => c.id !== id));
    showNotification('Recurring client removed');
  };

  const toggleRecurringPause = (id) => {
    setRecurringClients(recurringClients.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
    ));
  };

  const value = {
    user,
    isAuthenticated: !!user?.isAuthenticated,
    leads,
    jobs,
    crewMembers,
    invoices,
    recurringClients,
    stats,
    loading,
    notification,
    theme,
    toggleTheme,
    login,
    logout,
    submitLead,
    markLeadContacted,
    markLeadConverted,
    removeLead,
    createJob,
    updateJobStatus,
    removeJob,
    refreshData,
    // Crew
    addCrewMember,
    updateCrewMember,
    removeCrewMember,
    // Invoices
    addInvoice,
    updateInvoiceStatus,
    removeInvoice,
    // Recurring
    addRecurringClient,
    updateRecurringClient,
    removeRecurringClient,
    toggleRecurringPause
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
