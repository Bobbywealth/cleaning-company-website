import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const CustomerProfile = ({ customer, onClose, theme = 'dark' }) => {
  const { jobs, markLeadContacted, markLeadConverted, removeLead } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(customer.notes ? [customer.notes] : []);

  // Get customer's jobs
  const customerJobs = jobs.filter(job => 
    job.client?.toLowerCase() === customer.name.toLowerCase() ||
    job.email === customer.email
  );

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-3xl overflow-hidden`}>
      {/* Header */}
      <div className={`p-6 ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' : 'bg-gradient-to-r from-cyan-100 to-blue-100'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                Customer since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition`}
          >
            ✕
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <a 
            href={`tel:${customer.phone}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-400 text-white font-semibold hover:bg-green-500 transition"
          >
            📞 Call
          </a>
          <a 
            href={`sms:${customer.phone}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-400 text-white font-semibold hover:bg-blue-500 transition"
          >
            💬 Text
          </a>
          <a 
            href={`mailto:${customer.email}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-400 text-white font-semibold hover:bg-purple-500 transition"
          >
            ✉️ Email
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        {[
          { key: 'details', label: 'Details', icon: '👤' },
          { key: 'property', label: 'Property', icon: '🏠' },
          { key: 'jobs', label: 'Jobs', icon: '📅', count: customerJobs.length },
          { key: 'notes', label: 'Notes', icon: '📝', count: notes.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
              activeTab === tab.key
                ? 'border-cyan-400 text-cyan-400'
                : `${theme === 'dark' ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-900'}`
            }`}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-400/20">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                CONTACT INFORMATION
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">📞</span>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</p>
                    <a href={`tel:${customer.phone}`} className="font-semibold hover:text-cyan-400 transition">
                      {customer.phone}
                    </a>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                    <a href={`mailto:${customer.email}`} className="font-semibold hover:text-cyan-400 transition">
                      {customer.email}
                    </a>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">🧹</span>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Service</p>
                    <p className="font-semibold">{customer.service}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                STATUS
              </h3>
              <div className="flex gap-2">
                {customer.status === 'New' && (
                  <Button 
                    onClick={() => markLeadContacted(customer.id)}
                    className="bg-yellow-400 text-slate-950 hover:bg-yellow-300 rounded-xl"
                  >
                    ✓ Mark as Contacted
                  </Button>
                )}
                {customer.status === 'Contacted' && (
                  <Button 
                    onClick={() => markLeadConverted(customer.id)}
                    className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl"
                  >
                    ⭐ Convert to Customer
                  </Button>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                ACTIVITY TIMELINE
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400">
                    📋
                  </div>
                  <div>
                    <p className="font-medium">Lead Created</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
                {customer.status !== 'New' && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                      📞
                    </div>
                    <div>
                      <p className="font-medium">Contacted</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Customer has been reached out to
                      </p>
                    </div>
                  </div>
                )}
                {customer.status === 'Converted' && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
                      ⭐
                    </div>
                    <div>
                      <p className="font-medium">Converted to Customer</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Deal closed successfully
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'property' && (
          <div className="space-y-6">
            {/* Quote Estimate - Prominent Display */}
            {customer.estimatedLow && customer.estimatedHigh && (
              <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20' : 'bg-gradient-to-br from-cyan-100 to-blue-100'}`}>
                <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  💰 ESTIMATED QUOTE
                </p>
                <p className={`text-4xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  ${customer.estimatedLow} - ${customer.estimatedHigh}
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Based on the property details provided
                </p>
              </div>
            )}

            {/* Property Details */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                PROPERTY INFORMATION
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">🏠</span>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Property Size</p>
                    <p className="font-semibold">{customer.propertySize || 'Not specified'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">🚿</span>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Bathrooms</p>
                    <p className="font-semibold">{customer.bathrooms || 'Not specified'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Frequency</p>
                    <p className="font-semibold">{customer.frequency || 'One-time'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="text-xl">📍</span>
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>County</p>
                    <p className="font-semibold">{customer.county || 'Not specified'}</p>
                  </div>
                </div>
                {customer.cityArea && customer.cityArea !== 'Other' && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <span className="text-xl">🏘️</span>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>City/Area</p>
                      <p className="font-semibold">{customer.cityArea}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add-ons */}
            {customer.addOns && customer.addOns.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  SELECTED ADD-ONS
                </h3>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex flex-wrap gap-2">
                    {customer.addOns.map((addon, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-cyan-400/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}
                      >
                        ✓ {addon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Special Requests / Notes */}
            {(customer.specialRequests || (customer.notes && !customer.propertySize)) && (
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  SPECIAL REQUESTS
                </h3>
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className="whitespace-pre-wrap">{customer.specialRequests || customer.notes}</p>
                </div>
              </div>
            )}

            {/* No Property Data */}
            {!customer.propertySize && !customer.estimatedLow && (!customer.addOns || customer.addOns.length === 0) && (
              <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className="text-4xl mb-4">🏠</p>
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                  No property details available yet
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Property information will appear here once the customer completes Step 2
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            {customerJobs.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <p className="text-4xl mb-4">📅</p>
                <p>No jobs for this customer yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerJobs.map(job => (
                  <div 
                    key={job.id}
                    className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{job.service}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Completed' ? 'bg-green-400/20 text-green-400' :
                        job.status === 'Scheduled' ? 'bg-blue-400/20 text-blue-400' :
                        'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      📅 {job.date}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a note..."
                className={`flex-1 px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border border-white/10' : 'bg-slate-100 border border-slate-200'} outline-none focus:border-cyan-400`}
              />
              <Button 
                onClick={addNote}
                className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
              >
                Add
              </Button>
            </div>

            {/* Notes List */}
            {notes.length === 0 ? (
              <div className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <p className="text-4xl mb-4">📝</p>
                <p>No notes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}
                  >
                    <p>{note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <Button 
          onClick={() => {
            if (confirm('Delete this customer?')) {
              removeLead(customer.id);
              onClose();
            }
          }}
          className="w-full bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-xl"
        >
          🗑️ Delete Customer
        </Button>
      </div>
    </div>
  );
};

export default CustomerProfile;
