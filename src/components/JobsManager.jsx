import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const JobsManager = () => {
  const { jobs, createJob, updateJobStatus, removeJob } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({
    client: '',
    service: '',
    date: '',
    phone: '',
    email: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-400/15 text-green-200';
      case 'Scheduled': return 'bg-blue-400/15 text-blue-200';
      case 'Pending': return 'bg-yellow-400/15 text-yellow-200';
      case 'Completed': return 'bg-purple-400/15 text-purple-200';
      case 'Cancelled': return 'bg-red-400/15 text-red-200';
      default: return 'bg-slate-400/15 text-slate-300';
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Upcoming Jobs ({jobs.length})</h3>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
        >
          {showAddForm ? 'Cancel' : '+ Add Job'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-slate-900/80 border-white/10 rounded-2xl">
          <CardContent className="p-4">
            <form onSubmit={handleAddJob} className="grid md:grid-cols-2 gap-4">
              <input
                value={newJob.client}
                onChange={(e) => setNewJob({...newJob, client: e.target.value})}
                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 outline-none focus:border-cyan-300"
                placeholder="Client Name"
                required
              />
              <input
                value={newJob.service}
                onChange={(e) => setNewJob({...newJob, service: e.target.value})}
                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 outline-none focus:border-cyan-300"
                placeholder="Service Type"
                required
              />
              <input
                value={newJob.date}
                onChange={(e) => setNewJob({...newJob, date: e.target.value})}
                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 outline-none focus:border-cyan-300"
                placeholder="Date & Time"
                required
              />
              <input
                value={newJob.phone}
                onChange={(e) => setNewJob({...newJob, phone: e.target.value})}
                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 outline-none focus:border-cyan-300"
                placeholder="Phone"
              />
              <input
                value={newJob.email}
                onChange={(e) => setNewJob({...newJob, email: e.target.value})}
                className="rounded-xl bg-slate-800 border border-white/10 px-4 py-2 outline-none focus:border-cyan-300"
                placeholder="Email"
              />
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                Create Job
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-4">📅</p>
          <p>No jobs scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Card key={job.id} className="bg-white/10 border-white/10 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{job.client}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                      <span>🧹 {job.service}</span>
                      <span>📅 {job.date}</span>
                      {job.phone && <span>📞 {job.phone}</span>}
                      {job.email && <span>✉️ {job.email}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.status !== 'Completed' && (
                      <Button 
                        onClick={() => updateJobStatus(job.id, nextStatus(job.status))}
                        className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl text-sm"
                      >
                        Mark {nextStatus(job.status)}
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        if (confirm('Delete this job?')) removeJob(job.id);
                      }}
                      className="bg-red-400/20 text-red-300 hover:bg-red-400/30 rounded-xl text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsManager;
