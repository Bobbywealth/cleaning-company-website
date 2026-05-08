import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import LeadsList from '@/components/LeadsList';
import JobsManager from '@/components/JobsManager';

const adminModules = [
  { icon: "📋", label: "Lead & Quote CRM", color: "from-cyan-400/20 to-cyan-600/20" },
  { icon: "📅", label: "Job Scheduling", color: "from-blue-400/20 to-blue-600/20" },
  { icon: "👥", label: "Crew Management", color: "from-purple-400/20 to-purple-600/20" },
  { icon: "💵", label: "Invoices & Payments", color: "from-green-400/20 to-green-600/20" },
  { icon: "📊", label: "Reports & Analytics", color: "from-yellow-400/20 to-yellow-600/20" },
  { icon: "🛡️", label: "Settings & Roles", color: "from-red-400/20 to-red-600/20" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, stats, logout, notification } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leads', label: 'Leads' },
    { id: 'jobs', label: 'Jobs' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-semibold shadow-lg"
        >
          {notification.message}
        </motion.div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://iili.io/Btud5oF.th.png"
              alt="Cleaning Company Logo"
              className="h-12 w-12 rounded-xl object-cover border border-white/10"
            />
            <div>
              <p className="font-bold text-lg leading-none">Admin Dashboard</p>
              <p className="text-xs text-cyan-200">360 Cleaning Co.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden md:inline">
              Welcome, {user?.username}
            </span>
            <Button 
              onClick={handleLogout}
              className="bg-red-400/20 text-red-300 hover:bg-red-400/30 rounded-xl"
            >
              Logout 🚪
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-5 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <Card className="bg-white/10 border-white/10 rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">New Leads</p>
                    <p className="text-3xl font-black mt-1 text-white">{stats.newLeads}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center text-2xl">
                    👥
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Booked Jobs</p>
                    <p className="text-3xl font-black mt-1 text-white">{stats.bookedJobs}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-blue-400/20 flex items-center justify-center text-2xl">
                    📅
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Leads</p>
                    <p className="text-3xl font-black mt-1 text-white">{stats.totalLeads}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-green-400/20 flex items-center justify-center text-2xl">
                    💵
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Jobs</p>
                    <p className="text-3xl font-black mt-1 text-white">{stats.totalJobs}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-purple-400/20 flex items-center justify-center text-2xl">
                    📊
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Modules */}
            <Card className="bg-white/10 border-white/10 rounded-3xl mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-white mb-5">Admin Modules</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminModules.map((module) => (
                    <button
                      key={module.label}
                      onClick={() => {
                        if (module.label.includes('Lead')) setActiveTab('leads');
                        else if (module.label.includes('Job')) setActiveTab('jobs');
                      }}
                      className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${module.color} border border-white/10 p-4 hover:scale-[1.02] transition`}
                    >
                      <span className="text-2xl">{module.icon}</span>
                      <span className="font-semibold text-white">{module.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-white mb-5">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => setActiveTab('leads')}
                    className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
                  >
                    View All Leads 📋
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('jobs')}
                    className="bg-blue-400 text-slate-950 hover:bg-blue-300 rounded-xl"
                  >
                    Manage Jobs 📅
                  </Button>
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-white/10 text-white hover:bg-white/20 rounded-xl"
                  >
                    View Website →
                  </Button>
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
            <Card className="bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-white mb-5">Lead & Quote CRM</h2>
                <LeadsList />
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
            <Card className="bg-white/10 border-white/10 rounded-3xl">
              <CardContent className="p-6">
                <JobsManager />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
