import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const JobsManager = ({ theme = 'dark' }) => {
  const { jobs, createJob, updateJobStatus, removeJob } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [newJob, setNewJob] = useState({
    client: '',
    service: '',
    date: '',
    phone: '',
    email: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-400/20 text-green-400';
      case 'Scheduled': return 'bg-blue-400/20 text-blue-400';
      case 'Pending': return 'bg-yellow-400/20 text-yellow-400';
      case 'Completed': return 'bg-purple-400/20 text-purple-400';
      case 'Cancelled': return 'bg-red-400/20 text-red-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return '✅';
      case 'Scheduled': return '📅';
      case 'Pending': return '⏳';
      case 'Completed': return '✅';
      case 'Cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleAddJob = (e) => {
    e.preventDefault();
    if (!newJob.client || !newJob.service || !newJob.date) return;
    
    createJob(newJob);
    setNewJob({ client: '', service: '', date: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const nextStatus = (current) => {
    const flow = ['Pending', 'Confirmed', 'Scheduled', 'Completed'];
    const idx = flow.indexOf(current);
    return flow[idx + 1] || 'Completed';
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add padding for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add all days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getJobsForDate = (date) => {
    return jobs.filter(job => {
      const jobDate = new Date(job.date);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(selectedDate);
  const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group jobs by status
  const jobsByStatus = {
    Pending: jobs.filter(j => j.status === 'Pending'),
    Confirmed: jobs.filter(j => j.status === 'Confirmed'),
    Scheduled: jobs.filter(j => j.status === 'Scheduled'),
    Completed: jobs.filter(j => j.status === 'Completed'),
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold">Job Scheduling</h3>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className={`flex rounded-xl p-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'list' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'calendar' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              📅 Calendar
            </button>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
          >
            {showAddForm ? 'Cancel' : '+ Add Job'}
          </Button>
        </div>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <form onSubmit={handleAddJob} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                value={newJob.client}
                onChange={(e) => setNewJob({...newJob, client: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="👤 Client Name"
                required
              />
              <input
                value={newJob.service}
                onChange={(e) => setNewJob({...newJob, service: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="🧹 Service Type"
                required
              />
              <input
                value={newJob.date}
                onChange={(e) => setNewJob({...newJob, date: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="📅 Date (YYYY-MM-DD)"
                required
              />
              <input
                value={newJob.phone}
                onChange={(e) => setNewJob({...newJob, phone: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="📞 Phone"
              />
              <input
                value={newJob.email}
                onChange={(e) => setNewJob({...newJob, email: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="✉️ Email"
              />
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                ✅ Create Job
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Status Columns */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'Pending', jobs: jobsByStatus.Pending, color: 'from-yellow-400/20 to-yellow-600/20', icon: '⏳' },
              { status: 'Confirmed', jobs: jobsByStatus.Confirmed, color: 'from-green-400/20 to-green-600/20', icon: '✅' },
              { status: 'Scheduled', jobs: jobsByStatus.Scheduled, color: 'from-blue-400/20 to-blue-600/20', icon: '📅' },
              { status: 'Completed', jobs: jobsByStatus.Completed, color: 'from-purple-400/20 to-purple-600/20', icon: '✅' },
            ].map(column => (
              <div key={column.status} className={`rounded-2xl bg-gradient-to-br ${column.color} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <span>{column.icon}</span> {column.status}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-white/10' : 'bg-white/50'}`}>
                    {column.jobs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.jobs.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      No jobs
                    </p>
                  ) : (
                    column.jobs.map(job => (
                      <div 
                        key={job.id} 
                        className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'} backdrop-blur`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm">{job.client}</p>
                        </div>
                        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          🧹 {job.service}
                        </p>
                        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          📅 {job.date}
                        </p>
                        <div className="flex gap-1">
                          {job.status !== 'Completed' && (
                            <Button 
                              onClick={() => updateJobStatus(job.id, nextStatus(job.status))}
                              className="flex-1 bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 rounded-lg text-xs py-1"
                            >
                              → {nextStatus(job.status)}
                            </Button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm('Delete this job?')) removeJob(job.id);
                            }}
                            className="p-1.5 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={prevMonth}
                className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                ←
              </button>
              <h4 className="text-lg font-bold">{monthYear}</h4>
              <button 
                onClick={nextMonth}
                className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center text-xs font-medium py-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {days.map((date, idx) => {
                const dayJobs = date ? getJobsForDate(date) : [];
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={idx}
                    className={`min-h-[80px] p-1 rounded-xl border ${
                      date 
                        ? theme === 'dark' 
                          ? 'border-white/10' 
                          : 'border-slate-200'
                        : ''
                    } ${isToday ? 'bg-cyan-400/10 border-cyan-400/30' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs font-medium mb-1 ${
                          isToday ? 'text-cyan-400' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 2).map(job => (
                            <div 
                              key={job.id}
                              className={`text-[10px] px-1 py-0.5 rounded truncate ${getStatusColor(job.status)}`}
                              title={`${job.client} - ${job.service}`}
                            >
                              {job.client}
                            </div>
                          ))}
                          {dayJobs.length > 2 && (
                            <div className={`text-[10px] text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              +{dayJobs.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Count */}
      <div className={`flex justify-between items-center text-sm p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
          📊 Total: {jobs.length} jobs
        </span>
        <div className="flex gap-4">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            ⏳ Pending: {jobsByStatus.Pending.length}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            📅 Scheduled: {jobsByStatus.Scheduled.length}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            ✅ Completed: {jobsByStatus.Completed.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobsManager;
