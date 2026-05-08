import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import LeadsList from '@/components/LeadsList';
import JobsManager from '@/components/JobsManager';
import CustomerProfile from '@/components/CustomerProfile';
import MarketingCenter from '@/components/MarketingCenter';

const adminModules = [
  { icon: "📋", label: "Lead & Quote CRM", color: "from-cyan-400/20 to-cyan-600/20", tab: 'leads' },
  { icon: "📅", label: "Job Scheduling", color: "from-blue-400/20 to-blue-600/20", tab: 'jobs' },
  { icon: "👥", label: "Crew Management", color: "from-purple-400/20 to-purple-600/20", tab: 'crews' },
  { icon: "💵", label: "Invoices & Payments", color: "from-green-400/20 to-green-600/20", tab: 'invoices' },
  { icon: "📊", label: "Reports & Analytics", color: "from-yellow-400/20 to-yellow-600/20", tab: 'reports' },
  { icon: "⚙️", label: "Settings", color: "from-red-400/20 to-red-600/20", tab: 'settings' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, stats, logout, notification, leads, jobs, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '👥', badge: stats.newLeads > 0 ? stats.newLeads : null },
    { id: 'jobs', label: 'Jobs', icon: '📅', badge: jobs.length > 0 ? jobs.length : null },
    { id: 'customers', label: 'Customers', icon: '⭐' },
    { id: 'marketing', label: 'Marketing', icon: '📣' },
  ];

  // Calculate conversion rate
  const conversionRate = stats.totalLeads > 0 
    ? Math.round((stats.bookedJobs / stats.totalLeads) * 100) 
    : 0;

  // Get recent activity
  const recentLeads = [...leads].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  ).slice(0, 5);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
      <div className={`fixed inset-0 pointer-events-none opacity-40 ${theme === 'dark' ? '' : 'opacity-10'}`}>
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-semibold shadow-lg flex items-center gap-2"
          >
            <span>🔔</span> {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`relative z-10 border-b ${theme === 'dark' ? 'border-white/10 bg-slate-950/75' : 'border-slate-200 bg-white'} backdrop-blur-xl sticky top-0`}>
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img
                src="https://iili.io/Btud5oF.th.png"
                alt="Cleaning Company Logo"
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover border border-white/10"
              />
              <div>
                <p className="font-bold text-base md:text-lg leading-none">Admin Dashboard</p>
                <p className="text-xs text-cyan-400 hidden sm:block">360 Cleaning Co.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Bar */}
              <div className="hidden md:flex items-center bg-white/10 rounded-xl px-3 py-2">
                <span className="text-slate-400 mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Search leads, jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm w-48"
                />
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  autoRefresh 
                    ? 'bg-green-400/20 text-green-400' 
                    : 'bg-slate-400/20 text-slate-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
                {autoRefresh ? 'Live' : 'Paused'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                title="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                🔔
                {stats.newLeads > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {stats.newLeads}
                  </span>
                )}
              </button>

              <span className="text-sm text-slate-300 hidden lg:inline">
                {user?.username}
              </span>
              <Button 
                onClick={handleLogout}
                className="bg-red-400/20 text-red-300 hover:bg-red-400/30 rounded-xl text-sm"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">🚪</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cyan-400 text-slate-950'
                  : theme === 'dark' 
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id 
                    ? 'bg-slate-950/20' 
                    : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mb-4">
          <div className={`flex items-center rounded-xl px-4 py-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}`}>
            <span className="text-slate-400 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent outline-none flex-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                  <div>
                    <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>New Leads</p>
                    <p className="text-2xl md:text-3xl font-black mt-1">{stats.newLeads}</p>
                    <p className="text-xs text-green-400 mt-1">↑ This week</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-cyan-400/20 flex items-center justify-center text-xl">
                    👥
                  </div>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                  <div>
                    <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Booked Jobs</p>
                    <p className="text-2xl md:text-3xl font-black mt-1">{stats.bookedJobs}</p>
                    <p className="text-xs text-green-400 mt-1">↑ Active</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-400/20 flex items-center justify-center text-xl">
                    📅
                  </div>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                  <div>
                    <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Conversion</p>
                    <p className="text-2xl md:text-3xl font-black mt-1 text-green-400">{conversionRate}%</p>
                    <p className="text-xs text-slate-400 mt-1">Lead → Job</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-green-400/20 flex items-center justify-center text-xl">
                    📈
                  </div>
                </CardContent>
              </Card>
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                  <div>
                    <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Jobs</p>
                    <p className="text-2xl md:text-3xl font-black mt-1">{stats.totalJobs}</p>
                    <p className="text-xs text-purple-400 mt-1">All time</p>
                  </div>
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-purple-400/20 flex items-center justify-center text-xl">
                    ✅
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Recent Leads */}
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Leads</h2>
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="text-cyan-400 text-sm hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentLeads.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        No leads yet
                      </p>
                    ) : (
                      recentLeads.map(lead => (
                        <div 
                          key={lead.id} 
                          className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-400/20 flex items-center justify-center font-bold">
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{lead.name}</p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.phone}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.status === 'New' ? 'bg-cyan-400/20 text-cyan-400' :
                            lead.status === 'Contacted' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-green-400/20 text-green-400'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Jobs */}
              <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Upcoming Jobs</h2>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="text-cyan-400 text-sm hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {jobs.length === 0 ? (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        No jobs scheduled
                      </p>
                    ) : (
                      jobs.slice(0, 5).map(job => (
                        <div 
                          key={job.id} 
                          className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-400/20 flex items-center justify-center">
                              📅
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{job.client}</p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{job.service}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'Pending' ? 'bg-yellow-400/20 text-yellow-400' :
                            job.status === 'Confirmed' ? 'bg-green-400/20 text-green-400' :
                            job.status === 'Scheduled' ? 'bg-blue-400/20 text-blue-400' :
                            'bg-purple-400/20 text-purple-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Modules */}
            <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg font-bold mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">📋</span>
                    <span className="text-xs font-medium text-center">Lead & Quote CRM</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">📅</span>
                    <span className="text-xs font-medium text-center">Job Scheduling</span>
                  </button>
                  <button
                    onClick={() => alert('Crew Management coming soon!')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="text-xs font-medium text-center">Crew Management</span>
                  </button>
                  <button
                    onClick={() => alert('Invoices & Payments coming soon!')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">💵</span>
                    <span className="text-xs font-medium text-center">Invoices & Payments</span>
                  </button>
                  <button
                    onClick={() => alert('Reports & Analytics coming soon!')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">📊</span>
                    <span className="text-xs font-medium text-center">Reports & Analytics</span>
                  </button>
                  <button
                    onClick={() => alert('Settings coming soon!')}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-red-400/20 to-red-600/20 border border-white/10 p-4 hover:scale-105 transition"
                  >
                    <span className="text-2xl">⚙️</span>
                    <span className="text-xs font-medium text-center">Settings</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
              <CardContent className="p-4 md:p-6">
                <LeadsList 
                  searchQuery={searchQuery}
                  onCustomerClick={(lead) => setSelectedCustomer(lead)}
                  theme={theme}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
              <CardContent className="p-4 md:p-6">
                <JobsManager theme={theme} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-xl font-bold mb-4">All Customers</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads.filter(l => l.status === 'Converted').map(lead => (
                    <div 
                      key={lead.id}
                      onClick={() => setSelectedCustomer(lead)}
                      className={`p-4 rounded-2xl cursor-pointer hover:scale-102 transition ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-green-400/20 flex items-center justify-center text-xl font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{lead.name}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.phone}</p>
                        </div>
                      </div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{lead.service}</p>
                    </div>
                  ))}
                </div>
                {leads.filter(l => l.status === 'Converted').length === 0 && (
                  <p className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    No converted customers yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MarketingCenter theme={theme} />
          </motion.div>
        )}
      </main>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
            >
              <CustomerProfile 
                customer={selectedCustomer} 
                onClose={() => setSelectedCustomer(null)}
                theme={theme}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} py-4 text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        <p>Last updated: {lastRefresh.toLocaleTimeString()} | © 2026 360 Cleaning Co. Admin</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
