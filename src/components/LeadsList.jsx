import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useApp } from '@/context/AppContext';
import { getToken } from '@/services/api';
import {
  X, Search, ChevronLeft, ChevronRight, Plus, Upload,
  Edit, Trash2, Phone, Mail, Filter, ArrowUpDown, ChevronDown,
  User, Building2, Home, MapPin, FileText, Check, AlertCircle,
  ArrowUp, ArrowDown, Users
} from 'lucide-react';
import { getLeadStatusColor, getLeadSourceColor, formatDate } from '@/utils/dashboard';

const LeadsList = ({ searchQuery = '', onCustomerClick, theme = 'dark' }) => {
  const { leads, markLeadContacted, markLeadConverted, removeLead, addLead, updateLeadData } = useApp();
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const [sortConfig, setSortConfig] = useState({ key: 'created', direction: 'desc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const effectiveSearch = searchQuery || debouncedSearch;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = filter === 'all' || lead.status?.toLowerCase() === filter.toLowerCase();
      const matchesSource = sourceFilter === 'all' || 
        (lead.lead_source || 'Website') === sourceFilter;
      const matchesSearch = effectiveSearch === '' || 
        (lead.name && lead.name.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
        (lead.phone && lead.phone.includes(effectiveSearch)) ||
        (lead.email && lead.email.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
        (lead.service && lead.service.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
        (lead.business_type && lead.business_type.toLowerCase().includes(effectiveSearch.toLowerCase()));
      return matchesStatus && matchesSource && matchesSearch;
    });
  }, [leads, filter, sourceFilter, effectiveSearch]);

  const sortedLeads = useMemo(() => {
    const sorted = [...filteredLeads];
    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sortConfig.key) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'source':
          aVal = a.lead_source || '';
          bVal = b.lead_source || '';
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'created':
        default:
          aVal = new Date(a.created_at || a.createdAt || 0);
          bVal = new Date(b.created_at || b.createdAt || 0);
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
    return sorted;
  }, [filteredLeads, sortConfig]);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(start, start + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectLead = (leadId, index, event) => {
    if (event?.shiftKey && lastSelectedIndex !== -1) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = paginatedLeads.slice(start, end + 1).map(l => l.id);
      setSelectedLeads(prev => {
        const newSelected = [...prev];
        rangeIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      setSelectedLeads(prev => 
        prev.includes(leadId) 
          ? prev.filter(id => id !== leadId)
          : [...prev, leadId]
      );
    }
    setLastSelectedIndex(index);
  };

  const selectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(l => l.id));
    }
  };

  const bulkDelete = () => {
    selectedLeads.forEach(id => removeLead(id));
    setSelectedLeads([]);
  };

  const newLeadInitial = {
    name: '',
    phone: '',
    email: '',
    service: 'Commercial Cleaning',
    business_type: '',
    property_size: '',
    address: '',
    notes: ''
  };

  const [newLead, setNewLead] = useState(newLeadInitial);

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!newLead.name.trim()) errors.name = 'Name is required';
      if (!newLead.phone.trim()) errors.phone = 'Phone is required';
      else if (!/^[\d\s\-\(\)]+$/.test(newLead.phone)) errors.phone = 'Invalid phone format';
      if (newLead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLead.email)) {
        errors.email = 'Invalid email format';
      }
    }
    if (step === 2) {
      if (!newLead.service) errors.service = 'Service type is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(formStep)) {
      setFormStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) return;

    setIsLoading(true);
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
        setNewLead(newLeadInitial);
        setShowAddForm(false);
        setFormStep(1);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
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
        }
      } catch (error) {
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handleKeyDown = useCallback((e) => {
    if (showAddForm || editingLead || showImportModal) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, paginatedLeads.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const lead = paginatedLeads[focusedIndex];
      onCustomerClick?.(lead);
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1);
      setSelectedLeads([]);
    } else if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      selectAll();
    }
  }, [showAddForm, editingLead, showImportModal, focusedIndex, paginatedLeads, onCustomerClick]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex];
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, sortedLeads.length);

  const renderAddFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <User size={16} />
              <span>Step 1 of 3: Contact Info</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {newLead.service === 'Commercial Cleaning' ? 'Business Name *' : 'Contact Name *'}
              </label>
              <input
                type="text"
                value={newLead.name}
                onChange={(e) => {
                  setNewLead({...newLead, name: e.target.value});
                  if (formErrors.name) setFormErrors({...formErrors, name: ''});
                }}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
                placeholder={newLead.service === 'Commercial Cleaning' ? "Joe's Pizza & Pasta" : "John Smith"}
              />
              {formErrors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                value={newLead.phone}
                onChange={(e) => {
                  setNewLead({...newLead, phone: e.target.value});
                  if (formErrors.phone) setFormErrors({...formErrors, phone: ''});
                }}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
                placeholder="(555) 123-4567"
              />
              {formErrors.phone && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.phone}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => {
                  setNewLead({...newLead, email: e.target.value});
                  if (formErrors.email) setFormErrors({...formErrors, email: ''});
                }}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
                placeholder="contact@business.com"
              />
              {formErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.email}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <Building2 size={16} />
              <span>Step 2 of 3: Service Details</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Lead Type *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewLead({...newLead, service: 'Residential Cleaning', business_type: ''})}
                  className={`p-3 rounded-xl border-2 transition ${
                    newLead.service === 'Residential Cleaning' 
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Home size={20} className="mx-auto mb-1" />
                  <span className="text-xs">Residential</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewLead({...newLead, service: 'Commercial Cleaning'})}
                  className={`p-3 rounded-xl border-2 transition ${
                    newLead.service === 'Commercial Cleaning' 
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Building2 size={20} className="mx-auto mb-1" />
                  <span className="text-xs">Commercial</span>
                </button>
              </div>
              {formErrors.service && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.service}
                </p>
              )}
            </div>
            {newLead.service === 'Commercial Cleaning' && (
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <select
                  value={newLead.business_type}
                  onChange={(e) => setNewLead({...newLead, business_type: e.target.value})}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
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
                  <option value="Warehouse">Warehouse</option>
                  <option value="Daycare">Daycare</option>
                  <option value="Church">Church</option>
                  <option value="Auto Dealership">Auto Dealership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Property Size</label>
              <select
                value={newLead.property_size}
                onChange={(e) => setNewLead({...newLead, property_size: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
              >
                <option value="">Select size...</option>
                <option value="Small (<2,000 sqft)">Small (&lt;2,000 sqft)</option>
                <option value="Medium (2,000-5,000 sqft)">Medium (2,000-5,000 sqft)</option>
                <option value="Large (5,000-10,000 sqft)">Large (5,000-10,000 sqft)</option>
                <option value="Extra Large (>10,000 sqft)">Extra Large (&gt;10,000 sqft)</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <FileText size={16} />
              <span>Step 3 of 3: Additional Info</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={newLead.address}
                onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
                placeholder="123 Main St, Newark, NJ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
                placeholder={newLead.service === 'Commercial Cleaning' ? "Met owner at local event..." : "Referred by neighbor..."}
                rows={3}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Lead & Quote CRM</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setShowAddForm(true);
                setFormStep(1);
                setNewLead(newLeadInitial);
                setFormErrors({});
              }}
              className="bg-green-400 hover:bg-green-500 text-slate-950 rounded-xl text-sm"
            >
              <Plus size={16} className="mr-1" /> Add Lead
            </Button>
            <Button 
              onClick={() => setShowImportModal(true)}
              className="bg-purple-400 hover:bg-purple-500 text-slate-950 rounded-xl text-sm"
            >
              <Upload size={16} className="mr-1" /> Import
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction });
            }}
            className={`px-3 py-2 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-slate-100 border border-slate-200'} outline-none`}
          >
            <option value="created-desc">Newest First</option>
            <option value="created-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="status-asc">Status</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Sources', count: sourceCounts.all },
          { key: 'website', label: 'Website', count: sourceCounts.website },
          { key: 'coldcall', label: 'Cold Call', count: sourceCounts.coldcall },
          { key: 'referral', label: 'Referral', count: sourceCounts.referral },
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
            {source.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              sourceFilter === (source.key === 'all' ? 'all' : source.key === 'website' ? 'Website' : source.key === 'coldcall' ? 'Cold Call' : source.key === 'referral' ? 'Referral' : source.key) ? 'bg-slate-950/20' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
            }`}>
              {source.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search by name, phone, email, or service..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-white border border-slate-200'} outline-none focus:ring-2 focus:ring-cyan-400/50`}
        />
        {localSearch && (
          <button
            onClick={() => {
              setLocalSearch('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

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

      {selectedLeads.length > 0 && (
        <div className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-cyan-400/10 border border-cyan-400/20' : 'bg-cyan-50 border border-cyan-200'}`}>
          <span className="text-sm font-medium">
            {selectedLeads.length} selected
            <span className="text-xs text-slate-400 ml-2">(Shift+Click for range)</span>
          </span>
          <div className="flex gap-2">
            <Button 
              onClick={selectAll}
              className={`text-sm rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'}`}
            >
              {selectedLeads.length === paginatedLeads.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button 
              onClick={bulkDelete}
              className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-lg text-sm"
            >
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} theme={theme} />
          ))}
        </div>
      ) : paginatedLeads.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No leads found"
          description={effectiveSearch ? "Try adjusting your search or filters" : "Add your first lead to get started"}
          action={() => setShowAddForm(true)}
          actionLabel="Add Lead"
          theme={theme}
        />
      ) : (
        <div ref={listRef} className="space-y-3">
          {paginatedLeads.map((lead, index) => (
            <Card 
              key={lead.id}
              className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl transition-all group relative ${
                focusedIndex === index ? 'ring-2 ring-cyan-400' : ''
              } ${selectedLeads.includes(lead.id) ? 'ring-2 ring-cyan-400/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => toggleSelectLead(lead.id, index, e.nativeEvent)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded accent-cyan-400 cursor-pointer"
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
                            <h3 
                              className="font-bold text-base cursor-pointer hover:text-cyan-400 transition"
                              onClick={() => onCustomerClick?.(lead)}
                            >
                              {lead.name || 'Unknown'}
                            </h3>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getLeadSourceColor(lead.lead_source || 'Website')}`}>
                              {lead.lead_source || 'Website'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getLeadStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            {lead.business_type && (
                              <span className="text-xs text-slate-400">{lead.business_type}</span>
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
                            <Phone size={14} /> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`} 
                            className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}
                          >
                            <Mail size={14} /> {lead.email}
                          </a>
                        )}
                        {lead.service && (
                          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                            {lead.service}
                          </span>
                        )}
                      </div>
                      
                      {(lead.property_size || lead.bathrooms || lead.frequency || lead.county || lead.add_ons?.length > 0 || lead.estimated_low) && (
                        <div className={`mt-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                          <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            PROPERTY DETAILS
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
                                <span>{lead.bathrooms} bathrooms</span>
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
                                <MapPin size={14} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                                <span>{lead.county}</span>
                              </div>
                            )}
                          </div>
                          
                          {lead.estimated_low && lead.estimated_high && (
                            <div className="mt-3 pt-2 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                  ESTIMATED QUOTE
                                </span>
                                <span className={`text-lg font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                  ${lead.estimated_low} - ${lead.estimated_high}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {lead.address && (
                        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin size={12} className="inline mr-1" /> {lead.address}
                        </p>
                      )}

                      {lead.notes && (
                        <p className={`mt-2 text-sm italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          "{lead.notes}"
                        </p>
                      )}
                      <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(lead.created_at || lead.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.phone && (
                      <>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2 rounded-xl bg-green-400/20 text-green-400 hover:bg-green-400/30 transition"
                          title="Call"
                        >
                          <Phone size={16} />
                        </a>
                      </>
                    )}
                    {lead.status === 'New' && (
                      <Button
                        onClick={() => markLeadContacted(lead.id)}
                        className="bg-yellow-400 text-slate-950 hover:bg-yellow-300 rounded-xl text-sm"
                      >
                        <Check size={14} className="mr-1" /> Contacted
                      </Button>
                    )}
                    {lead.status === 'Contacted' && (
                      <Button
                        onClick={() => markLeadConverted(lead.id)}
                        className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl text-sm"
                      >
                        Convert
                      </Button>
                    )}
                    <Button
                      onClick={() => setEditingLead(lead)}
                      className="bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 rounded-xl text-sm"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => removeLead(lead.id)}
                      className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-xl text-sm"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-4 text-sm">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            Showing {startIndex}-{endIndex} of {sortedLeads.length} leads
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-white border border-slate-200'} outline-none`}
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'} disabled:opacity-50`}
          >
            <ChevronLeft size={18} />
          </Button>
          
          {getPageNumbers().map((page, idx) => (
            typeof page === 'number' ? (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  currentPage === page
                    ? 'bg-cyan-400 text-slate-950'
                    : theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="w-8 text-center">...</span>
            )
          ))}
          
          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'} disabled:opacity-50`}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Lead</h3>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setFormStep(1);
                  setFormErrors({});
                }}
                className="text-2xl hover:opacity-70 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    formStep >= step 
                      ? 'bg-cyan-400 text-slate-950' 
                      : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
                  }`}>
                    {formStep > step ? <Check size={14} /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${formStep > step ? 'bg-cyan-400' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              {renderAddFormStep()}
              
              <div className="flex gap-3 pt-4">
                {formStep > 1 && (
                  <Button 
                    type="button"
                    onClick={handlePrevStep}
                    className={`flex-1 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
                  >
                    Back
                  </Button>
                )}
                {formStep < 3 ? (
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-green-400 hover:bg-green-500 text-slate-950 rounded-xl"
                  >
                    {isLoading ? 'Adding...' : 'Add Lead'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Import Leads</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-2xl hover:opacity-70 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <p className="text-sm font-semibold mb-2">CSV Format:</p>
                <code className="text-xs text-slate-400 block">
                  Name,Phone,Email,BusinessType,Address,Notes
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
                <Upload size={16} className="mr-2" /> Choose CSV File
              </Button>
            </div>
          </div>
        </div>
      )}

      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Lead</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-2xl hover:opacity-70 transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                service: formData.get('service'),
                business_type: formData.get('business_type'),
                address: formData.get('address'),
                notes: formData.get('notes'),
                status: formData.get('status')
              };
              try {
                await updateLeadData(editingLead.id, updates);
              } catch (error) {
                console.error('Failed to update lead:', error);
              }
              setEditingLead(null);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingLead.name}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingLead.phone}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingLead.email}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service</label>
                <select
                  name="service"
                  defaultValue={editingLead.service}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                >
                  <option value="Residential Cleaning">Residential Cleaning</option>
                  <option value="Commercial Cleaning">Commercial Cleaning</option>
                  <option value="Deep Cleaning">Deep Cleaning</option>
                  <option value="Move In/Out">Move In/Out</option>
                  <option value="Post-Construction">Post-Construction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <input
                  type="text"
                  name="business_type"
                  defaultValue={editingLead.business_type}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingLead.address}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingLead.status}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingLead.notes}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'} outline-none`}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className={`flex-1 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;