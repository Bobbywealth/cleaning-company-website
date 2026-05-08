import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const LeadsList = ({ searchQuery = '', onCustomerClick, theme = 'dark' }) => {
  const { leads, markLeadContacted, markLeadConverted, removeLead } = useApp();
  const [filter, setFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Filter leads
  let filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort leads
  filteredLeads.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-cyan-400/20 text-cyan-400';
      case 'Contacted': return 'bg-yellow-400/20 text-yellow-400';
      case 'Converted': return 'bg-green-400/20 text-green-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const bulkDelete = () => {
    if (confirm(`Delete ${selectedLeads.length} selected leads?`)) {
      selectedLeads.forEach(id => removeLead(id));
      setSelectedLeads([]);
    }
  };

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Lead & Quote CRM</h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-slate-100 border border-slate-200'} outline-none`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Leads', count: statusCounts.all },
          { key: 'new', label: 'New', count: statusCounts.new },
          { key: 'contacted', label: 'Contacted', count: statusCounts.contacted },
          { key: 'converted', label: 'Converted', count: statusCounts.converted },
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              filter === status.key 
                ? 'bg-cyan-400 text-slate-950' 
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === status.key ? 'bg-slate-950/20' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
            }`}>
              {status.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-cyan-400/10 border border-cyan-400/20' : 'bg-cyan-50 border border-cyan-200'}`}>
          <span className="text-sm font-medium">
            {selectedLeads.length} selected
          </span>
          <div className="flex gap-2">
            <Button 
              onClick={selectAll}
              className={`text-sm rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              onClick={bulkDelete}
              className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-lg text-sm"
            >
              Delete Selected 🗑️
            </Button>
          </div>
        </div>
      )}

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          <p className="text-4xl mb-4">📋</p>
          <p>No leads found</p>
          {searchQuery && <p className="text-sm mt-2">Try a different search term</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <Card 
              key={lead.id} 
              className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl transition-all hover:scale-[1.01]`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelectLead(lead.id)}
                      className="mt-1 w-4 h-4 rounded accent-cyan-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div 
                          onClick={() => onCustomerClick?.(lead)}
                          className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition"
                        >
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-base cursor-pointer hover:text-cyan-400 transition" onClick={() => onCustomerClick?.(lead)}>
                            {lead.name}
                          </h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <a 
                          href={`tel:${lead.phone}`} 
                          className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-300 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}
                        >
                          <span>📞</span> {lead.phone}
                        </a>
                        <a 
                          href={`mailto:${lead.email}`} 
                          className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}
                        >
                          <span>✉️</span> {lead.email}
                        </a>
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                          <span>🧹</span> {lead.service}
                        </span>
                      </div>
                      {lead.notes && (
                        <p className={`mt-2 text-sm italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          "{lead.notes}"
                        </p>
                      )}
                      <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        📅 {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2 ml-12 md:ml-0">
                    <a 
                      href={`tel:${lead.phone}`}
                      className="p-2 rounded-xl bg-green-400/20 text-green-400 hover:bg-green-400/30 transition"
                      title="Call"
                    >
                      📞
                    </a>
                    <a 
                      href={`sms:${lead.phone}`}
                      className="p-2 rounded-xl bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 transition"
                      title="Text"
                    >
                      💬
                    </a>
                    {lead.status === 'New' && (
                      <Button 
                        onClick={() => markLeadContacted(lead.id)}
                        className="bg-yellow-400 text-slate-950 hover:bg-yellow-300 rounded-xl text-sm"
                      >
                        ✓ Contacted
                      </Button>
                    )}
                    {lead.status === 'Contacted' && (
                      <Button 
                        onClick={() => markLeadConverted(lead.id)}
                        className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl text-sm"
                      >
                        ⭐ Convert
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        if (confirm('Delete this lead?')) removeLead(lead.id);
                      }}
                      className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-xl text-sm"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Bar */}
      <div className={`flex justify-between items-center text-sm p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
        <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
          Showing {filteredLeads.length} of {leads.length} leads
        </span>
        <div className="flex gap-4">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            📋 New: {statusCounts.new}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            📞 Contacted: {statusCounts.contacted}
          </span>
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            ⭐ Converted: {statusCounts.converted}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadsList;
