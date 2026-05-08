import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const CrewManagement = ({ theme = 'dark' }) => {
  const { crewMembers, addCrewMember, updateCrewMember, removeCrewMember } = useApp();
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'Cleaner', phone: '', email: '' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-400/20 text-green-400';
      case 'busy': return 'bg-yellow-400/20 text-yellow-400';
      case 'off': return 'bg-slate-400/20 text-slate-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '✅';
      case 'busy': return '⏳';
      case 'off': return '🔴';
      default: return '⚪';
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    addCrewMember({
      ...newMember,
      status: 'available',
      jobsToday: 0,
      avatar: newMember.name.charAt(0).toUpperCase()
    });
    setNewMember({ name: '', role: 'Cleaner', phone: '', email: '' });
    setShowAddForm(false);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'busy' : 'available';
    updateCrewMember(id, { status: newStatus });
  };

  const availableCrew = crewMembers.filter(m => m.status === 'available').length;
  const busyCrew = crewMembers.filter(m => m.status === 'busy').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Crew Management</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your cleaning team
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
        >
          {showAddForm ? 'Cancel' : '+ Add Team Member'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{availableCrew}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Available</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{busyCrew}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>On Job</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{crewMembers.length}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Team</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Add Team Member</h3>
            <form onSubmit={handleAddMember} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Full Name"
                required
              />
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
              >
                <option>Lead Cleaner</option>
                <option>Cleaner</option>
                <option>Supervisor</option>
              </select>
              <input
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Phone"
                required
              />
              <input
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Email"
                required
              />
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                ✅ Add Member
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Crew Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {crewMembers.map(member => (
          <Card 
            key={member.id}
            className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl hover:scale-[1.02] transition cursor-pointer`}
            onClick={() => setSelectedCrew(member)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4 mb-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  member.status === 'available' 
                    ? 'bg-green-400/20 text-green-400' 
                    : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{member.name}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {getStatusIcon(member.status)} {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  📅 {member.jobsToday} jobs today
                </span>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`tel:${member.phone}`}
                  className="flex-1 p-2 rounded-xl bg-green-400/20 text-green-400 hover:bg-green-400/30 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  📞
                </a>
                <a 
                  href={`sms:${member.phone}`}
                  className="flex-1 p-2 rounded-xl bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  💬
                </a>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleStatus(member.id, member.status); }}
                  className={`flex-1 p-2 rounded-xl text-center transition ${
                    member.status === 'available'
                      ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                      : 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
                  }`}
                >
                  {member.status === 'available' ? '🔄 Busy' : '✅ Available'}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Crew Detail Modal */}
      {selectedCrew && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedCrew(null)}
        >
          <div 
            className={`w-full max-w-md rounded-3xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                selectedCrew.status === 'available' 
                  ? 'bg-green-400/20 text-green-400' 
                  : 'bg-yellow-400/20 text-yellow-400'
              }`}>
                {selectedCrew.avatar}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedCrew.name}</h2>
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{selectedCrew.role}</p>
              </div>
              <button 
                onClick={() => setSelectedCrew(null)}
                className="ml-auto text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</p>
                <a href={`tel:${selectedCrew.phone}`} className="font-semibold">{selectedCrew.phone}</a>
              </div>
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                <a href={`mailto:${selectedCrew.email}`} className="font-semibold">{selectedCrew.email}</a>
              </div>
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCrew.status)}`}>
                  {selectedCrew.status.charAt(0).toUpperCase() + selectedCrew.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => { toggleStatus(selectedCrew.id, selectedCrew.status); setSelectedCrew(null); }}
                className="flex-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
              >
                Toggle Status
              </Button>
              <Button 
                onClick={() => { removeCrewMember(selectedCrew.id); setSelectedCrew(null); }}
                className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-xl"
              >
                🗑️ Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;
