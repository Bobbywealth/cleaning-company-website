import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { 
  GripVertical, Calendar, Plus, X, ChevronLeft, ChevronRight, 
  Clock, MapPin, User, Phone, Mail, Trash2, Edit, Check, Filter
} from 'lucide-react';

const JobsManager = ({ theme = 'dark' }) => {
  const { jobs, createJob, updateJobStatus, removeJob } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    client: '',
    service: '',
    date: '',
    phone: '',
    email: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayJobs, setSelectedDayJobs] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [quickAddColumn, setQuickAddColumn] = useState(null);
  const [quickAddData, setQuickAddData] = useState({ client: '', service: '' });
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [draggedJob, setDraggedJob] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const listRef = useRef(null);
  const allJobIds = useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    allJobIds.current = filteredJobs.map(j => j.id);
  }, [jobs, filters]);

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

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-400';
      case 'Scheduled': return 'bg-blue-400';
      case 'Pending': return 'bg-yellow-400';
      case 'Completed': return 'bg-purple-400';
      case 'Cancelled': return 'bg-red-400';
      default: return 'bg-slate-400';
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.status && job.status !== filters.status) return false;
    if (filters.dateFrom && new Date(job.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(job.date) > new Date(filters.dateTo)) return false;
    return true;
  });

  const jobsByStatus = {
    Pending: filteredJobs.filter(j => j.status === 'Pending'),
    Confirmed: filteredJobs.filter(j => j.status === 'Confirmed'),
    Scheduled: filteredJobs.filter(j => j.status === 'Scheduled'),
    Completed: filteredJobs.filter(j => j.status === 'Completed'),
  };

  const handleAddJob = (e) => {
    e.preventDefault();
    if (!newJob.client || !newJob.service || !newJob.date) return;
    createJob({ ...newJob, status: 'Pending' });
    setNewJob({ client: '', service: '', date: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleQuickAdd = (status) => {
    if (!quickAddData.client.trim() || !quickAddData.service.trim()) return;
    createJob({ 
      ...quickAddData, 
      date: new Date().toISOString().split('T')[0],
      phone: '',
      email: '',
      status 
    });
    setQuickAddData({ client: '', service: '' });
    setQuickAddColumn(null);
  };

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'scale(0.95)';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    e.target.style.transform = 'scale(1)';
    setDraggedJob(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedJob && draggedJob.status !== status) {
      updateJobStatus(draggedJob.id, status);
    }
    setDraggedJob(null);
    setDragOverColumn(null);
  };

  const nextStatus = (current) => {
    const flow = ['Pending', 'Confirmed', 'Scheduled', 'Completed'];
    const idx = flow.indexOf(current);
    return flow[idx + 1] || 'Completed';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
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
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, allJobIds.current.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      setSelectedJob(allJobIds.current[focusedIndex]);
      setExpandedJob(expandedJob === allJobIds.current[focusedIndex] ? null : allJobIds.current[focusedIndex]);
    } else if (e.key === 'd' && selectedJob) {
      e.preventDefault();
      if (confirm('Delete this job?')) {
        removeJob(selectedJob);
        setSelectedJob(null);
      }
    }
  }, [focusedIndex, expandedJob, selectedJob, removeJob]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const days = getDaysInMonth(calendarDate);
  const monthYear = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const SkeletonCard = () => (
    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white/80'} animate-pulse`}>
      <div className={`h-4 w-24 rounded mb-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
      <div className={`h-3 w-32 rounded mb-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
      <div className={`h-3 w-20 rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
    </div>
  );

  const JobCard = ({ job, columnStatus }) => {
    const isExpanded = expandedJob === job.id;
    const isDragging = draggedJob?.id === job.id;
    const isSelected = selectedJob === job.id;
    const isFocused = focusedIndex === allJobIds.current.indexOf(job.id);
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, job)}
        onDragEnd={handleDragEnd}
        onClick={() => setExpandedJob(isExpanded ? null : job.id)}
        className={`
          p-3 rounded-xl cursor-pointer transition-all duration-200 group
          ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-white/80 hover:bg-white'}
          ${isDragging ? 'opacity-50 scale-95' : ''}
          ${isSelected ? 'ring-2 ring-cyan-400' : ''}
          ${isFocused ? 'ring-2 ring-cyan-400/50' : ''}
          backdrop-blur border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}
        `}
      >
        <div className="flex items-start gap-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pt-1">
            <GripVertical size={14} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{job.client}</p>
            <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {job.service}
            </p>
            <p className={`text-xs mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <Calendar size={10} />
              {job.date}
            </p>
            
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                {job.phone && (
                  <p className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Phone size={12} /> {job.phone}
                  </p>
                )}
                {job.email && (
                  <p className={`text-xs flex items-center gap-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Mail size={12} /> {job.email}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  {job.status !== 'Completed' && (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); updateJobStatus(job.id, nextStatus(job.status)); }}
                      size="sm"
                      className="bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 rounded-lg text-xs py-1 px-2"
                    >
                      <Check size={12} className="mr-1" />
                      {nextStatus(job.status)}
                    </Button>
                  )}
                  <Button 
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete this job?')) removeJob(job.id); }}
                    size="sm"
                    className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-lg text-xs py-1 px-2"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const QuickAdd = ({ status }) => (
    <div className={`p-2 rounded-xl border-2 border-dashed mt-2 ${theme === 'dark' ? 'border-white/20' : 'border-slate-300'}`}>
      <input
        value={quickAddData.client}
        onChange={(e) => setQuickAddData({...quickAddData, client: e.target.value})}
        placeholder="Client name"
        className={`w-full text-xs px-2 py-1 rounded mb-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(status)}
      />
      <input
        value={quickAddData.service}
        onChange={(e) => setQuickAddData({...quickAddData, service: e.target.value})}
        placeholder="Service"
        className={`w-full text-xs px-2 py-1 rounded mb-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd(status)}
      />
      <div className="flex gap-1">
        <Button 
          onClick={() => handleQuickAdd(status)}
          size="sm"
          className="flex-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-lg text-xs py-1"
        >
          <Check size={12} />
        </Button>
        <Button 
          onClick={() => { setQuickAddColumn(null); setQuickAddData({ client: '', service: '' }); }}
          size="sm"
          className="bg-slate-400/20 text-slate-400 hover:bg-slate-400/30 rounded-lg text-xs py-1 px-2"
        >
          <X size={12} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4" ref={listRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-xl font-bold">Job Scheduling</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className={`rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
          >
            <Filter size={16} className="mr-1" />
            Filter
          </Button>
          <div className={`flex rounded-xl p-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'list' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                viewMode === 'calendar' 
                  ? 'bg-cyan-400 text-slate-950' 
                  : theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Cancel' : 'Add Job'}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className={`rounded-xl px-3 py-2 text-sm ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className={`rounded-xl px-3 py-2 text-sm ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                />
              </div>
              <div>
                <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className={`rounded-xl px-3 py-2 text-sm ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                />
              </div>
              <Button 
                onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '' })}
                variant="ghost"
                size="sm"
                className="rounded-xl"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <form onSubmit={handleAddJob} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <User size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  value={newJob.client}
                  onChange={(e) => setNewJob({...newJob, client: e.target.value})}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                  placeholder="Client Name"
                  required
                />
              </div>
              <div className="relative">
                <Clock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  value={newJob.service}
                  onChange={(e) => setNewJob({...newJob, service: e.target.value})}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                  placeholder="Service Type"
                  required
                />
              </div>
              <div className="relative">
                <Calendar size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="date"
                  value={newJob.date}
                  onChange={(e) => setNewJob({...newJob, date: e.target.value})}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                  required
                />
              </div>
              <div className="relative">
                <Phone size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  value={newJob.phone}
                  onChange={(e) => setNewJob({...newJob, phone: e.target.value})}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                  placeholder="Phone"
                />
              </div>
              <div className="relative">
                <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  value={newJob.email}
                  onChange={(e) => setNewJob({...newJob, email: e.target.value})}
                  className={`w-full rounded-xl pl-10 pr-4 py-2.5 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400`}
                  placeholder="Email"
                />
              </div>
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                <Check size={16} className="mr-2" />
                Create Job
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {viewMode === 'list' && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'Pending', jobs: jobsByStatus.Pending, color: 'from-yellow-400/20 to-yellow-600/20', borderColor: 'border-yellow-400/30' },
              { status: 'Confirmed', jobs: jobsByStatus.Confirmed, color: 'from-green-400/20 to-green-600/20', borderColor: 'border-green-400/30' },
              { status: 'Scheduled', jobs: jobsByStatus.Scheduled, color: 'from-blue-400/20 to-blue-600/20', borderColor: 'border-blue-400/30' },
              { status: 'Completed', jobs: jobsByStatus.Completed, color: 'from-purple-400/20 to-purple-600/20', borderColor: 'border-purple-400/30' },
            ].map(column => (
              <div 
                key={column.status} 
                className={`
                  rounded-2xl bg-gradient-to-br ${column.color} p-4 border-2 transition-all duration-200
                  ${dragOverColumn === column.status ? `${column.borderColor} ring-2 ring-cyan-400/50` : 'border-transparent'}
                  ${theme === 'dark' ? '' : ''}
                `}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    {column.status}
                    <span className={`w-2 h-2 rounded-full ${getStatusDotColor(column.status)}`}></span>
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-white/10' : 'bg-white/50'}`}>
                    {loading ? '-' : column.jobs.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {loading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : column.jobs.length === 0 ? (
                    <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      No jobs
                    </p>
                  ) : (
                    column.jobs.map(job => <JobCard key={job.id} job={job} columnStatus={column.status} />)
                  )}
                  {quickAddColumn === column.status ? (
                    <QuickAdd status={column.status} />
                  ) : (
                    <button
                      onClick={() => setQuickAddColumn(column.status)}
                      className={`w-full p-2 rounded-xl border-2 border-dashed text-xs flex items-center justify-center gap-1 transition ${theme === 'dark' ? 'border-white/20 hover:border-white/40 text-slate-400 hover:text-slate-300' : 'border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-600'}`}
                    >
                      <Plus size={14} />
                      Quick Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === 'calendar' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={prevMonth}
                className={`p-2 rounded-xl hover:bg-white/10 transition`}
              >
                <ChevronLeft size={20} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
              </button>
              <h4 className="text-lg font-bold">{monthYear}</h4>
              <button 
                onClick={nextMonth}
                className={`p-2 rounded-xl hover:bg-white/10 transition`}
              >
                <ChevronRight size={20} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={`text-center text-xs font-medium py-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {day}
                </div>
              ))}
              
              {days.map((date, idx) => {
                const dayJobs = date ? getJobsForDate(date) : [];
                const isToday = date && date.toDateString() === new Date().toDateString();
                const isSelected = selectedDayJobs && date && selectedDayJobs.toDateString() === date.toDateString();
                
                return (
                  <div 
                    key={idx}
                    onClick={() => date && dayJobs.length > 0 && setSelectedDayJobs(date)}
                    className={`min-h-[80px] p-1 rounded-xl border transition-all cursor-pointer ${
                      date 
                        ? theme === 'dark' 
                          ? 'border-white/10 hover:border-white/20' 
                          : 'border-slate-200 hover:border-slate-300'
                        : ''
                    } ${isToday ? 'border-2 border-cyan-400 bg-cyan-400/5' : ''} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-xs font-medium mb-1 ${
                          isToday ? 'text-cyan-400' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 3).map(job => (
                            <div 
                              key={job.id}
                              className={`h-1.5 w-full rounded-full ${getStatusDotColor(job.status)}`}
                              title={`${job.client} - ${job.service}`}
                            />
                          ))}
                          {dayJobs.length > 3 && (
                            <div className={`text-[10px] text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              +{dayJobs.length - 3}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedDayJobs && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold">
                    Jobs for {selectedDayJobs.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h5>
                  <button 
                    onClick={() => setSelectedDayJobs(null)}
                    className={`p-1 rounded-lg hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {getJobsForDate(selectedDayJobs).map(job => (
                    <div 
                      key={job.id}
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className={`p-3 rounded-xl cursor-pointer ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} transition`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{job.client}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{job.service}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      {expandedJob === job.id && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                          {job.phone && <p className="text-xs flex items-center gap-1"><Phone size={10} /> {job.phone}</p>}
                          {job.email && <p className="text-xs flex items-center gap-1"><Mail size={10} /> {job.email}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className={`flex flex-wrap justify-between items-center text-sm p-3 rounded-xl gap-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
          Total: {loading ? '-' : filteredJobs.length} jobs
        </span>
        <div className="flex flex-wrap gap-4">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
            Pending: {loading ? '-' : jobsByStatus.Pending.length}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
            Confirmed: {loading ? '-' : jobsByStatus.Confirmed.length}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
            Scheduled: {loading ? '-' : jobsByStatus.Scheduled.length}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
            Completed: {loading ? '-' : jobsByStatus.Completed.length}
          </span>
        </div>
      </div>

      <div className={`text-xs text-center p-2 rounded-xl ${theme === 'dark' ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
        Keyboard: ↑↓ Navigate • Enter Select/Expand • D Delete
      </div>
    </div>
  );
};

export default JobsManager;
