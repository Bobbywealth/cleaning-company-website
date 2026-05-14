import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { getToken } from '@/services/api';

const LeadsList = ({ searchQuery = '', onCustomerClick, theme = 'dark' }) => {
  const { leads, markLeadContacted, markLeadConverted, removeLead, addLead } = useApp();
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const fileInputRef = useRef(null);

  // Combined search from props + local state
  const effectiveSearch = searchQuery || localSearch;

  // New lead form state
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Commercial Cleaning',
    business_type: '',
    address: '',
    notes: ''
  });

  // Filter leads
  let filteredLeads = leads.filter(lead => {
    const matchesStatus = filter === 'all' || lead.status.toLowerCase() === filter.toLowerCase();
    const matchesSource = sourceFilter === 'all' || 
      (lead.lead_source || 'Website') === sourceFilter;
    const matchesSearch = effectiveSearch === '' || 
      (lead.name && lead.name.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      (lead.phone && lead.phone.includes(effectiveSearch)) ||
      (lead.email && lead.email.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      (lead.service && lead.service.toLowerCase().includes(effectiveSearch.toLowerCase()));
    return matchesStatus && matchesSource && matchesSearch;
  });

  // Sort leads
  filteredLeads.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
    if (sortBy === 'oldest') return new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
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

  const getSourceColor = (source) => {
    switch (source) {
      case 'Website': return 'bg-blue-400/20 text-blue-400';
      case 'Cold Call': return 'bg-orange-400/20 text-orange-400';
      case 'Referral': return 'bg-purple-400/20 text-purple-400';
      case 'Google': return 'bg-red-400/20 text-red-400';
      case 'Facebook': return 'bg-indigo-400/20 text-indigo-400';
      case 'Yelp': return 'bg-green-400/20 text-green-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Website': return '🌐';
      case 'Cold Call': return '📞';
      case 'Referral': return '🤝';
      case 'Google': return '🔍';
      case 'Facebook': return '📘';
      case 'Yelp': return '⭐';
      default: return '📋';
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

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) {
      alert('Name and phone are required');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLead,
          lead_source: 'Cold Call',
          status: 'New'
        }),
      });

      if (response.ok) {
        const lead = await response.json();
        addLead(lead);
        setNewLead({
          name: '',
          phone: '',
          email: '',
          service: 'Commercial Cleaning',
          business_type: '',
          address: '',
          notes: ''
        });
        setShowAddForm(false);
        alert('Commercial prospect added!');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Failed to add lead');
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataRows = lines.slice(1);
        
        const leadsToImport = dataRows.map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
          return {
            name: cols[0] || '',
            phone: cols[1] || '',
            email: cols[2] || '',
            business_type: cols[3] || '',
            address: cols[4] || '',
            service: 'Commercial Cleaning',
            lead_source: 'Cold Call',
            notes: cols[5] || ''
          };
        }).filter(l => l.name || l.phone);

        if (leadsToImport.length === 0) {
          alert('No valid leads found in CSV');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({ leads: leadsToImport })
        });

        if (response.ok) {
          const result = await response.json();
          result.leads.forEach(lead => addLead(lead));
          setShowImportModal(false);
          alert(`Successfully imported ${result.count} commercial prospects!`);
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        console.error('CSV import error:', error);
        alert('Failed to import CSV. Make sure format is: Name,Phone,Email,BusinessType,Address,Notes');
      }
    };
    reader.readAsText(file);
  };

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };

  const sourceCounts = {
    all: leads.length,
    website: leads.filter(l => (l.lead_source || 'Website') === 'Website').length,
    coldcall: leads.filter(l => l.lead_source === 'Cold Call').length,
    referral: leads.filter(l => l.lead_source === 'Referral').length,
    other: leads.filter(l => !['Website', 'Cold Call', 'Referral'].includes(l.lead_source)).length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Lead & Quote CRM</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-green-400 hover:bg-green-500 text-slate-950 rounded-xl text-sm"
            >
              + Add Prospect
            </Button>
            <Button 
              onClick={() => setShowImportModal(true)}
              className="bg-purple-400 hover:bg-purple-500 text-slate-950 rounded-xl text-sm"
            >
              📥 Import CSV
            </Button>
          </div>
        </div>
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

      {/* Source Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Sources', count: sourceCounts.all, icon: '📋' },
          { key: 'website', label: 'Website', count: sourceCounts.website, icon: '🌐' },
          { key: 'coldcall', label: 'Cold Call', count: sourceCounts.coldcall, icon: '📞' },
          { key: 'referral', label: 'Referral', count: sourceCounts.referral, icon: '🤝' },
        ].map(source => (
          <button
            key={source.key}
            onClick={() => setSourceFilter(source.key === 'all' ? 'all' : source.key === 'website' ? 'Website' : source.key === 'coldcall' ? 'Cold Call' : source.key === 'referral' ? 'Referral' : source.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              sourceFilter === (source.key === 'all' ? 'all' : source.key === 'website' ? 'Website' : source.key === 'coldcall' ? 'Cold Call' : source.key === 'referral' ? 'Referral' : source.key)
                ? 'bg-orange-400 text-slate-950' 
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {source.icon} {source.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              sourceFilter === (source.key === 'all' ? 'all' : source.key === 'website' ? 'Website' : source.key === 'coldcall' ? 'Cold Call' : source.key === 'referral' ? 'Referral' : source.key) ? 'bg-slate-950/20' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
            }`}>
              {source.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Search by name, phone, email, or service..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-white border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'new', label: 'New', count: statusCounts.new },
          { key: 'contacted', label: 'Contacted', count: statusCounts.contacted },
          { key: 'converted', label: 'Converted', count: statusCounts.converted },
        ].map(status => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === status.key 
                ? 'bg-cyan-400 text-slate-950' 
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status.label} ({status.count})
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
                          {(lead.name || 'N').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base cursor-pointer hover:text-cyan-400 transition" onClick={() => onCustomerClick?.(lead)}>
                              {lead.name || 'Unknown'}
                            </h3>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getSourceColor(lead.lead_source || 'Website')}`}>
                              {getSourceIcon(lead.lead_source || 'Website')} {lead.lead_source || 'Website'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            {lead.business_type && (
                              <span className="text-xs text-slate-400">🏢 {lead.business_type}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`} 
                            className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-300 hover:text-green-400' : 'text-slate-600 hover:text-green-600'}`}
                          >
                            <span>📞</span> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`} 
                            className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}
                          >
                            <span>✉️</span> {lead.email}
                          </a>
                        )}
                        {lead.service && (
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                            <span>🧹</span> {lead.service}
                          </span>
                        )}
                      </div>
                      
                      {/* Property Details Section */}
                      {(lead.property_size || lead.bathrooms || lead.frequency || lead.county || lead.add_ons?.length > 0 || lead.estimated_low) && (
                        <div className={`mt-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                          <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            📋 PROPERTY DETAILS
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {lead.property_size && (
                              <div className="flex items-center gap-2">
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>🏠</span>
                                <span>{lead.property_size}</span>
                              </div>
                            )}
                            {lead.bathrooms && (
                              <div className="flex items-center gap-2">
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>🚿</span>
                                <span>{lead.bathrooms} {parseFloat(lead.bathrooms) === 1 ? 'bathroom' : 'bathrooms'}</span>
                              </div>
                            )}
                            {lead.frequency && (
                              <div className="flex items-center gap-2">
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>🔄</span>
                                <span>{lead.frequency}</span>
                              </div>
                            )}
                            {lead.county && (
                              <div className="flex items-center gap-2">
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>📍</span>
                                <span>{lead.county}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Quote Estimate */}
                          {lead.estimated_low && lead.estimated_high && (
                            <div className="mt-3 pt-2 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                  💰 ESTIMATED QUOTE
                                </span>
                                <span className={`text-lg font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                  ${lead.estimated_low} - ${lead.estimated_high}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Address for commercial leads */}
                      {lead.address && (
                        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          📍 {lead.address}
                        </p>
                      )}

                      {lead.notes && (
                        <p className={`mt-2 text-sm italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          "{lead.notes}"
                        </p>
                      )}
                      <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        📅 {formatDate(lead.created_at || lead.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="flex flex-wrap gap-2 ml-12 md:ml-0">
                    {lead.phone && (
                      <>
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
                      </>
                    )}
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

      {/* Add Prospect Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Commercial Prospect</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business/Contact Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  placeholder="Joe's Pizza & Pasta"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  placeholder="contact@business.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <select
                  value={newLead.business_type}
                  onChange={(e) => setNewLead({...newLead, business_type: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                >
                  <option value="">Select type...</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Bar/Club">Bar/Club</option>
                  <option value="Dental Office">Dental Office</option>
                  <option value="Medical Office">Medical Office</option>
                  <option value="Office Building">Office Building</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Gym/Fitness">Gym/Fitness</option>
                  <option value="Salon/Spa">Salon/Spa</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={newLead.address}
                  onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  placeholder="123 Main St, Newark, NJ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  placeholder="Met owner at local event..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-green-400 hover:bg-green-500 text-slate-950 rounded-xl"
                >
                  Add Prospect
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Import Commercial Prospects</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <p className="text-sm font-semibold mb-2">📋 CSV Format Required:</p>
                <code className="text-xs text-slate-400 block">
                  Name,Phone,Email,BusinessType,Address,Notes<br/>
                  Joe's Pizza,(555)123-4567,joe@pizza.com,Restaurant,123 Main St,Referred by...
                </code>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-purple-400 hover:bg-purple-500 text-slate-950 rounded-xl py-4"
              >
                📥 Choose CSV File
              </Button>
              <p className="text-xs text-center text-slate-400">
                Leads will be imported as "Cold Call" prospects with status "New"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
