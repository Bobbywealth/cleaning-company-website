import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM'
];

const serviceTypes = [
  'Commercial Walkthrough',
  'Quote Visit',
  'Follow-up Visit',
  'Initial Assessment'
];

const statusColors = {
  Scheduled: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  Confirmed: 'bg-green-400/20 text-green-400 border-green-400/30',
  Completed: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
  Cancelled: 'bg-red-400/20 text-red-400 border-red-400/30',
  'No-Show': 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  Converted: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30'
};

const statusDotColors = {
  Scheduled: 'bg-blue-400',
  Confirmed: 'bg-green-400',
  Completed: 'bg-purple-400',
  Cancelled: 'bg-red-400',
  'No-Show': 'bg-orange-400',
  Converted: 'bg-cyan-400'
};

const WalkthroughScheduler = ({ isOpen, onClose, onSave, editWalkthrough = null, preselectedLead = null }) => {
  const { leads } = useApp();
  const [formData, setFormData] = useState({
    lead_id: preselectedLead?.id || editWalkthrough?.lead_id || '',
    scheduled_date: editWalkthrough?.scheduled_date || new Date().toISOString().split('T')[0],
    scheduled_time: editWalkthrough?.scheduled_time || '10:00 AM',
    duration_minutes: editWalkthrough?.duration_minutes || 60,
    address: editWalkthrough?.address || preselectedLead?.address || '',
    service_type: editWalkthrough?.service_type || 'Commercial Walkthrough',
    notes: editWalkthrough?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === parseInt(formData.lead_id) || l.id === formData.lead_id);
  }, [leads, formData.lead_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lead_id || !formData.scheduled_date || !formData.scheduled_time) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        ...formData,
        id: editWalkthrough?.id
      });
      onClose();
    } catch (err) {
      setError('Failed to save walkthrough');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-lg rounded-2xl ${'bg-slate-900 border border-white/10'} overflow-hidden max-h-[90vh] overflow-y-auto`}>
        <div className={`px-6 py-4 border-b border-white/10 flex items-center justify-between`}>
          <h3 className="text-xl font-bold">
            {editWalkthrough ? 'Edit Walkthrough' : 'Schedule Walkthrough'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-400/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Lead *</label>
            <select
              value={formData.lead_id}
              onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
              required
            >
              <option value="">Select a lead...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.phone} ({lead.service || 'No service'})
                </option>
              ))}
            </select>
            {selectedLead && (
              <div className="mt-2 p-3 rounded-xl bg-white/5 text-sm">
                <p className="text-slate-300">{selectedLead.phone}</p>
                {selectedLead.email && <p className="text-slate-400">{selectedLead.email}</p>}
                {selectedLead.address && <p className="text-slate-400">{selectedLead.address}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Date *</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Time *</label>
              <select
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
                required
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Duration</label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Service Type</label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
              >
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
              placeholder="123 Main St, Newark, NJ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-cyan-400"
              rows={3}
              placeholder="Additional notes about this walkthrough..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl"
            >
              {isSubmitting ? 'Saving...' : editWalkthrough ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WalkthroughCalendar = ({ theme = 'dark' }) => {
  const { walkthroughs, leads, createWalkthrough, updateWalkthroughStatus, removeWalkthrough } = useApp();
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [editWalkthrough, setEditWalkthrough] = useState(null);
  const [preselectedLead, setPreselectedLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const handleScheduleWalkthrough = (event) => {
      setPreselectedLead(event.detail);
      setEditWalkthrough(null);
      setShowScheduler(true);
    };

    window.addEventListener('scheduleWalkthrough', handleScheduleWalkthrough);
    return () => window.removeEventListener('scheduleWalkthrough', handleScheduleWalkthrough);
  }, []);

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

  const getWalkthroughsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return walkthroughs.filter(w => w.scheduled_date === dateStr);
  };

  const days = getDaysInMonth(calendarDate);
  const monthYear = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const filteredWalkthroughs = useMemo(() => {
    if (filterStatus === 'all') return walkthroughs;
    return walkthroughs.filter(w => w.status === filterStatus);
  }, [walkthroughs, filterStatus]);

  const todayWalkthroughs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return walkthroughs.filter(w => w.scheduled_date === today && w.status !== 'Cancelled');
  }, [walkthroughs]);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSaveWalkthrough = async (data) => {
    if (data.id) {
      await updateWalkthroughStatus(data.id, data);
    } else {
      await createWalkthrough(data);
    }
  };

  const handleStatusChange = async (walkthroughId, newStatus) => {
    await updateWalkthroughStatus(walkthroughId, { status: newStatus });
    setSelectedWalkthrough(null);
  };

  const handleDeleteWalkthrough = async (walkthroughId) => {
    if (confirm('Are you sure you want to delete this walkthrough?')) {
      await removeWalkthrough(walkthroughId);
      setSelectedWalkthrough(null);
    }
  };

  const handleScheduleFromLead = (lead) => {
    setPreselectedLead(lead);
    setEditWalkthrough(null);
    setShowScheduler(true);
  };

  const statusCounts = useMemo(() => {
    const counts = { all: walkthroughs.length, Scheduled: 0, Confirmed: 0, Completed: 0, Cancelled: 0, 'No-Show': 0, Converted: 0 };
    walkthroughs.forEach(w => {
      if (counts[w.status] !== undefined) counts[w.status]++;
    });
    return counts;
  }, [walkthroughs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold">Walkthrough Calendar</h3>
          {todayWalkthroughs.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/20 text-cyan-400">
              {todayWalkthroughs.length} today
            </span>
          )}
        </div>
        <Button
          onClick={() => {
            setPreselectedLead(null);
            setEditWalkthrough(null);
            setShowScheduler(true);
          }}
          className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl"
        >
          <Plus size={16} className="mr-1" />
          Schedule Walkthrough
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'Scheduled', label: 'Scheduled' },
          { key: 'Confirmed', label: 'Confirmed' },
          { key: 'Completed', label: 'Completed' },
          { key: 'Cancelled', label: 'Cancelled' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterStatus === filter.key
                ? 'bg-cyan-400 text-slate-950'
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label} ({statusCounts[filter.key]})
          </button>
        ))}
      </div>

      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <ChevronLeft size={20} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
            </button>
            <h4 className="text-lg font-bold">{monthYear}</h4>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <ChevronRight size={20} className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {day}
              </div>
            ))}

            {days.map((date, idx) => {
              const dayWalkthroughs = date ? getWalkthroughsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date && selectedDate.toDateString() === date.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[80px] p-1 rounded-xl border transition-all cursor-pointer ${
                    date
                      ? theme === 'dark'
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-slate-200 hover:border-slate-300'
                      : ''
                  } ${
                    isToday
                      ? 'border-2 border-cyan-400 bg-cyan-400/5'
                      : ''
                  } ${
                    isSelected
                      ? 'ring-2 ring-cyan-400'
                      : ''
                  }`}
                >
                  {date && (
                    <>
                      <div
                        className={`text-xs font-medium mb-1 ${
                          isToday
                            ? 'text-cyan-400'
                            : theme === 'dark'
                              ? 'text-slate-400'
                              : 'text-slate-500'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayWalkthroughs.slice(0, 3).map(w => (
                          <div
                            key={w.id}
                            className={`h-5 px-1 rounded text-[10px] font-medium flex items-center gap-0.5 truncate ${
                              statusColors[w.status] || statusColors.Scheduled
                            }`}
                            title={`${w.lead_name || 'Unknown'} - ${w.scheduled_time}`}
                          >
                            <Clock size={8} />
                            {w.lead_name?.split(' ')[0] || 'Unknown'}
                          </div>
                        ))}
                        {dayWalkthroughs.length > 3 && (
                          <div
                            className={`text-[10px] text-center ${
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            +{dayWalkthroughs.length - 3}
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

      {selectedDate && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h5>
              <button
                onClick={() => setSelectedDate(null)}
                className={`p-1 rounded-lg hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {getWalkthroughsForDate(selectedDate).length === 0 ? (
                <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No walkthroughs scheduled
                </p>
              ) : (
                getWalkthroughsForDate(selectedDate).map(w => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWalkthrough(w)}
                    className={`p-3 rounded-xl cursor-pointer ${
                      theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
                    } transition`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${statusDotColors[w.status] || 'bg-slate-400'}`} />
                        <div>
                          <p className="font-semibold text-sm">{w.lead_name || 'Unknown Lead'}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {w.scheduled_time} - {w.service_type}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[w.status] || statusColors.Scheduled
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <Button
                onClick={() => {
                  setPreselectedLead(null);
                  setEditWalkthrough(null);
                  setShowScheduler(true);
                }}
                className="w-full mt-2 border-2 border-dashed border-white/20 hover:border-cyan-400/50 bg-transparent hover:bg-cyan-400/10 text-slate-400 hover:text-cyan-400 rounded-xl"
              >
                <Plus size={14} className="mr-1" />
                Add Walkthrough
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedWalkthrough && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'} overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between`}>
              <h3 className="text-xl font-bold">Walkthrough Details</h3>
              <button
                onClick={() => setSelectedWalkthrough(null)}
                className="p-2 rounded-xl hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {(selectedWalkthrough.lead_name || 'U').charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedWalkthrough.lead_name || 'Unknown'}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[selectedWalkthrough.status] || statusColors.Scheduled
                    }`}
                  >
                    {selectedWalkthrough.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(selectedWalkthrough.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  <span>{selectedWalkthrough.scheduled_time} ({selectedWalkthrough.duration_minutes} min)</span>
                </div>
                {selectedWalkthrough.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{selectedWalkthrough.address}</span>
                  </div>
                )}
                {selectedWalkthrough.lead_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span>{selectedWalkthrough.lead_phone}</span>
                  </div>
                )}
              </div>

              {selectedWalkthrough.service_type && (
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Service Type
                  </p>
                  <p className="text-sm font-medium">{selectedWalkthrough.service_type}</p>
                </div>
              )}

              {selectedWalkthrough.notes && (
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Notes
                  </p>
                  <p className="text-sm">{selectedWalkthrough.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className={`text-xs font-semibold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedWalkthrough.id, status)}
                      disabled={selectedWalkthrough.status === status}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedWalkthrough.status === status
                          ? statusColors[status]
                          : theme === 'dark'
                            ? 'bg-white/10 hover:bg-white/20'
                            : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setEditWalkthrough(selectedWalkthrough);
                    setShowScheduler(true);
                    setSelectedWalkthrough(null);
                  }}
                  className="flex-1 bg-blue-400 hover:bg-blue-300 text-white rounded-xl"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteWalkthrough(selectedWalkthrough.id)}
                  className="flex-1 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded-xl"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WalkthroughScheduler
        isOpen={showScheduler}
        onClose={() => {
          setShowScheduler(false);
          setPreselectedLead(null);
          setEditWalkthrough(null);
        }}
        onSave={handleSaveWalkthrough}
        editWalkthrough={editWalkthrough}
        preselectedLead={preselectedLead}
      />
    </div>
  );
};

export default WalkthroughCalendar;
