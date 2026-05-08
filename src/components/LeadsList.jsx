import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const LeadsList = () => {
  const { leads, markLeadContacted, markLeadConverted, removeLead } = useApp();
  const [filter, setFilter] = useState('all');

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status.toLowerCase() === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-cyan-400/15 text-cyan-200';
      case 'Contacted': return 'bg-yellow-400/15 text-yellow-200';
      case 'Converted': return 'bg-green-400/15 text-green-200';
      default: return 'bg-slate-400/15 text-slate-300';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'New', 'Contacted', 'Converted'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === status 
                ? 'bg-cyan-400 text-slate-950' 
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {status === 'all' ? 'All Leads' : status}
            {status !== 'all' && (
              <span className="ml-2 opacity-70">
                ({leads.filter(l => l.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-4">📋</p>
          <p>No leads found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <Card key={lead.id} className="bg-white/10 border-white/10 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                      <span>📞 {lead.phone}</span>
                      <span>✉️ {lead.email}</span>
                      <span>🧹 {lead.service}</span>
                    </div>
                    {lead.notes && (
                      <p className="mt-2 text-sm text-slate-400 italic">"{lead.notes}"</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">Received: {formatDate(lead.createdAt)}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {lead.status === 'New' && (
                      <Button 
                        onClick={() => markLeadContacted(lead.id)}
                        className="bg-yellow-400 text-slate-950 hover:bg-yellow-300 rounded-xl text-sm"
                      >
                        Mark Contacted
                      </Button>
                    )}
                    {lead.status === 'Contacted' && (
                      <Button 
                        onClick={() => markLeadConverted(lead.id)}
                        className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl text-sm"
                      >
                        Convert to Customer
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        if (confirm('Delete this lead?')) removeLead(lead.id);
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

export default LeadsList;
