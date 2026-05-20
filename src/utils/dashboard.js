// Lead status colors and labels
export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONVERTED: 'Converted'
};

export const getLeadStatusColor = (status) => {
  switch (status) {
    case 'New': return 'bg-cyan-400/20 text-cyan-400';
    case 'Contacted': return 'bg-yellow-400/20 text-yellow-400';
    case 'Converted': return 'bg-green-400/20 text-green-400';
    default: return 'bg-slate-400/20 text-slate-400';
  }
};

// Job status colors and labels
export const JOB_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const getJobStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return 'bg-green-400/20 text-green-400';
    case 'Scheduled': return 'bg-blue-400/20 text-blue-400';
    case 'Pending': return 'bg-yellow-400/20 text-yellow-400';
    case 'Completed': return 'bg-purple-400/20 text-purple-400';
    case 'Cancelled': return 'bg-red-400/20 text-red-400';
    default: return 'bg-slate-400/20 text-slate-400';
  }
};

// Invoice status colors
export const INVOICE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue'
};

export const getInvoiceStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'bg-green-400/20 text-green-400';
    case 'pending': return 'bg-yellow-400/20 text-yellow-400';
    case 'overdue': return 'bg-red-400/20 text-red-400';
    default: return 'bg-slate-400/20 text-slate-400';
  }
};

// Crew status colors
export const CREW_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFF: 'off'
};

export const getCrewStatusColor = (status) => {
  switch (status) {
    case 'available': return 'bg-green-400/20 text-green-400';
    case 'busy': return 'bg-yellow-400/20 text-yellow-400';
    case 'off': return 'bg-slate-400/20 text-slate-400';
    default: return 'bg-slate-400/20 text-slate-400';
  }
};

// Lead source colors
export const getLeadSourceColor = (source) => {
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

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
