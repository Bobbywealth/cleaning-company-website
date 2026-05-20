import React, { useState, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useApp } from '@/context/AppContext';
import { getCrewStatusColor } from '@/utils/dashboard';
import {
  HardHat,
  Users,
  Plus,
  X,
  Phone,
  Mail,
  MessageSquare,
  Check,
  Clock,
  UserPlus,
  Trash2,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserX,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ToggleSwitch = memo(({ id, currentStatus, onToggle }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
      currentStatus === 'available' ? 'bg-emerald-500' : currentStatus === 'busy' ? 'bg-amber-500' : 'bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
        currentStatus === 'available' ? 'left-7' : currentStatus === 'busy' ? 'left-4' : 'left-1'
      }`}
    />
  </button>
));

const getStatusIcon = (status) => {
  switch (status) {
    case 'available': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'busy': return <Clock className="w-3.5 h-3.5" />;
    case 'off': return <XCircle className="w-3.5 h-3.5" />;
    default: return <XCircle className="w-3.5 h-3.5" />;
  }
};

const CrewManagement = ({ theme = 'dark' }) => {
  const { crewMembers, addCrewMember, updateCrewMember, removeCrewMember } = useApp();
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newMember, setNewMember] = useState({ name: '', role: 'Cleaner', phone: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(crewMembers.length / ITEMS_PER_PAGE);
  const paginatedCrew = crewMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const validateForm = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^[\d\s\-+()]+$/.test(data.phone)) errors.phone = 'Invalid phone format';
    if (!data.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email format';
    return errors;
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const errors = validateForm(newMember);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    addCrewMember({
      ...newMember,
      status: 'available',
      jobsToday: 0,
      avatar: newMember.name.charAt(0).toUpperCase()
    });
    setNewMember({ name: '', role: 'Cleaner', phone: '', email: '' });
    setShowAddForm(false);
  };

  const handleEditMember = (e) => {
    e.preventDefault();
    const errors = validateForm(editData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    updateCrewMember(selectedCrew.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const toggleStatus = (id, currentStatus) => {
    const statusCycle = { available: 'busy', busy: 'off', off: 'available' };
    const newStatus = statusCycle[currentStatus] || 'available';
    updateCrewMember(id, { status: newStatus });
  };

  const openEdit = (crew) => {
    setEditData({ name: crew.name, role: crew.role, phone: crew.phone, email: crew.email });
    setIsEditing(true);
  };

  const availableCrew = crewMembers.filter(m => m.status === 'available').length;
  const busyCrew = crewMembers.filter(m => m.status === 'busy').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-cyan-400/20' : 'bg-cyan-100'}`}>
            <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Crew Management</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage your cleaning team
            </p>
          </div>
        </div>
        <Button
          onClick={() => { setShowAddForm(!showAddForm); setFormErrors({}); }}
          className={`${theme === 'dark' ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-500'} rounded-xl gap-2`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Team Member'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <p className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{availableCrew}</p>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Available</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <Clock className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
            <p className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{busyCrew}</p>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>On Job</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <HardHat className={`w-6 h-6 mx-auto mb-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <p className={`text-2xl md:text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{crewMembers.length}</p>
            <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Team</p>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <UserPlus className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                Add Team Member
              </h3>
              <button onClick={() => { setShowAddForm(false); setFormErrors({}); }} className={`p-1.5 rounded-lg hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <input
                  value={newMember.name}
                  onChange={(e) => { setNewMember({...newMember, name: e.target.value}); setFormErrors({...formErrors, name: ''}); }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Full Name"
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.name}</p>}
              </div>
              <div>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition`}
                >
                  <option>Lead Cleaner</option>
                  <option>Cleaner</option>
                  <option>Supervisor</option>
                </select>
              </div>
              <div>
                <input
                  value={newMember.phone}
                  onChange={(e) => { setNewMember({...newMember, phone: e.target.value}); setFormErrors({...formErrors, phone: ''}); }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.phone ? 'border-red-500' : ''}`}
                  placeholder="Phone"
                />
                {formErrors.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.phone}</p>}
              </div>
              <div>
                <input
                  value={newMember.email}
                  onChange={(e) => { setNewMember({...newMember, email: e.target.value}); setFormErrors({...formErrors, email: ''}); }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Email"
                />
                {formErrors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.email}</p>}
              </div>
              <Button type="submit" className={`sm:col-span-2 lg:col-span-4 ${theme === 'dark' ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-500'} rounded-xl gap-2`}>
                <Check className="w-4 h-4" /> Add Member
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} theme={theme} />
          ))}
        </div>
      ) : crewMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No crew members yet"
          description="Start building your team by adding your first cleaning crew member."
          action={() => setShowAddForm(true)}
          actionLabel="Add First Member"
          theme={theme}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedCrew.map(member => (
              <Card
                key={member.id}
                className={`${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-lg'} rounded-2xl transition-all duration-200 cursor-pointer group`}
                onClick={() => setSelectedCrew(member)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ring-2 ring-offset-2 ring-offset-transparent transition ${
                      member.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30'
                        : member.status === 'busy'
                        ? 'bg-amber-500/20 text-amber-400 ring-amber-500/30'
                        : 'bg-slate-500/20 text-slate-400 ring-slate-500/30'
                    }`}>
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{member.name}</h3>
                      <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getCrewStatusColor(member.status)}`}>
                      {getStatusIcon(member.status)}
                      <span className="hidden sm:inline">{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                      <span className="sm:hidden">{member.status.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{member.jobsToday} jobs</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <a
                      href={`tel:${member.phone}`}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-4 h-4" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                    <a
                      href={`sms:${member.phone}`}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">SMS</span>
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(member.id, member.status); }}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition ${
                        member.status === 'available'
                          ? theme === 'dark' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">{member.status === 'available' ? 'Busy' : 'Avail'}</span>
                    </button>
                  </div>

                  <div className={`pt-3 border-t flex justify-between items-center ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(member); }}
                      className={`p-2 rounded-lg transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                      <ToggleSwitch id={member.id} currentStatus={member.status} onToggle={() => toggleStatus(member.id, member.status)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl gap-1`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-medium">{currentPage}</span>
                <span>of</span>
                <span className="font-medium">{totalPages}</span>
              </div>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl gap-1`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {selectedCrew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => { setSelectedCrew(null); setIsEditing(false); }}
        >
          <div
            className={`w-full max-w-md rounded-3xl ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border-2 p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    Edit Member
                  </h2>
                  <button onClick={() => setIsEditing(false)} className={`p-1.5 rounded-lg hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditMember} className="space-y-4">
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Name</label>
                    <input
                      value={editData.name}
                      onChange={(e) => { setEditData({...editData, name: e.target.value}); setFormErrors({...formErrors, name: ''}); }}
                      className={`w-full rounded-xl mt-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.name ? 'border-red-500' : ''}`}
                    />
                    {formErrors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Role</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                      className={`w-full rounded-xl mt-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition`}
                    >
                      <option>Lead Cleaner</option>
                      <option>Cleaner</option>
                      <option>Supervisor</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                    <input
                      value={editData.phone}
                      onChange={(e) => { setEditData({...editData, phone: e.target.value}); setFormErrors({...formErrors, phone: ''}); }}
                      className={`w-full rounded-xl mt-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {formErrors.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                    <input
                      value={editData.email}
                      onChange={(e) => { setEditData({...editData, email: e.target.value}); setFormErrors({...formErrors, email: ''}); }}
                      className={`w-full rounded-xl mt-1 ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition ${formErrors.email ? 'border-red-500' : ''}`}
                    />
                    {formErrors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.email}</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" onClick={() => setIsEditing(false)} className={`flex-1 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl`}>
                      Cancel
                    </Button>
                    <Button type="submit" className={`flex-1 ${theme === 'dark' ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' : 'bg-cyan-600 text-white hover:bg-cyan-500'} rounded-xl gap-2`}>
                      <Check className="w-4 h-4" /> Save
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ring-4 ${
                    selectedCrew.status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30'
                      : selectedCrew.status === 'busy'
                      ? 'bg-amber-500/20 text-amber-400 ring-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 ring-slate-500/30'
                  }`}>
                    <HardHat className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selectedCrew.name}</h2>
                    <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>{selectedCrew.role}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedCrew(null); setIsEditing(false); }}
                    className={`p-2 rounded-xl hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Phone</p>
                    </div>
                    <a href={`tel:${selectedCrew.phone}`} className="font-semibold hover:underline">{selectedCrew.phone}</a>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                    </div>
                    <a href={`mailto:${selectedCrew.email}`} className="font-semibold hover:underline">{selectedCrew.email}</a>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Jobs Today</p>
                    </div>
                    <p className="font-semibold">{selectedCrew.jobsToday}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedCrew.status)}
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                      </div>
                      <ToggleSwitch id={selectedCrew.id} currentStatus={selectedCrew.status} onToggle={() => toggleStatus(selectedCrew.id, selectedCrew.status)} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => openEdit(selectedCrew)} className={`flex-1 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} rounded-xl gap-2`}>
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button onClick={() => { toggleStatus(selectedCrew.id, selectedCrew.status); }} className={`${selectedCrew.status === 'available' ? theme === 'dark' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-600 hover:bg-amber-200' : theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'} rounded-xl gap-2`}>
                    <Filter className="w-4 h-4" /> Toggle
                  </Button>
                  <Button onClick={() => { removeCrewMember(selectedCrew.id); setSelectedCrew(null); }} className={`${theme === 'dark' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'} rounded-xl`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;
