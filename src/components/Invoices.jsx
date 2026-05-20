import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useApp } from '@/context/AppContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  CreditCard,
  DollarSign,
  Send,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Plus,
  X,
  Mail,
  Phone,
  FileText,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Inbox
} from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4`}>
      <Icon className="h-12 w-12 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">{description}</p>
    {action && onAction && (
      <Button onClick={onAction} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
        <Plus className="h-4 w-4 mr-2" />
        {action}
      </Button>
    )}
  </div>
);

const STATUS_OPTIONS = ['pending', 'paid', 'overdue'];

const StatusBadge = ({ status, onClick, theme }) => {
  const getStatusConfig = (s) => {
    switch (s) {
      case 'paid':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock };
      case 'overdue':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: FileText };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} hover:opacity-80 transition-opacity cursor-pointer`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

const StatusDropdown = ({ currentStatus, onSelect, onClose, theme }) => {
  return (
    <div className="absolute z-20 mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl py-1 min-w-[140px]">
      {STATUS_OPTIONS.filter(s => s !== currentStatus).map(status => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className="w-full px-3 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 transition-colors"
        >
          <StatusBadge status={status} theme={theme} />
        </button>
      ))}
      <button
        onClick={onClose}
        className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/10 flex items-center gap-2 transition-colors border-t border-white/10 mt-1 pt-1"
      >
        <X className="h-3 w-3" />
        Cancel
      </button>
    </div>
  );
};

const Invoices = ({ theme = 'dark' }) => {
  const { invoices, addInvoice, updateInvoiceStatus, removeInvoice, updateInvoice } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [newInvoice, setNewInvoice] = useState({ client: '', email: '', amount: '', service: '' });
  const [sendingEmail, setSendingEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, perPage: 20 });
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/config`);
        const data = await res.json();
        if (data.publishableKey) {
          setPublishableKey(data.publishableKey);
          setStripePromise(loadStripe(data.publishableKey));
        }
      } catch (err) {
        console.log('Stripe not configured');
      }
    };
    loadStripeConfig();
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter(i => i.status === filterStatus);

  const totalPages = Math.ceil(filteredInvoices.length / pagination.perPage);
  const paginatedInvoices = filteredInvoices.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

  const validateForm = () => {
    const errors = {};
    if (!newInvoice.client.trim()) {
      errors.client = 'Client name is required';
    }
    if (!newInvoice.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInvoice.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!newInvoice.amount || parseFloat(newInvoice.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('360cleaning_auth') ? JSON.parse(localStorage.getItem('360cleaning_auth')).token : ''}`
        },
        body: JSON.stringify({
          id: `INV-${Date.now()}`,
          client: newInvoice.client,
          email: newInvoice.email,
          amount: parseFloat(newInvoice.amount),
          service: newInvoice.service,
          status: 'pending'
        }),
      });

      if (response.ok) {
        const invoice = await response.json();
        addInvoice(invoice);
        setNewInvoice({ client: '', email: '', amount: '', service: '' });
        setShowCreateForm(false);
        setFormErrors({});
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice || !stripePromise) return;

    setPaymentLoading(true);

    try {
      const authData = localStorage.getItem('360cleaning_auth');
      const token = authData ? JSON.parse(authData).token : '';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: selectedInvoice.amount,
          invoiceId: selectedInvoice.id,
          clientEmail: selectedInvoice.email,
          description: `Invoice ${selectedInvoice.id} - ${selectedInvoice.client}`
        }),
      });

      const data = await response.json();

      if (data.error) {
        setPaymentLoading(false);
        return;
      }

      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/#/invoices',
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        updateInvoiceStatus(selectedInvoice.id, 'paid');
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }

    setPaymentLoading(false);
  };

  const deleteInvoice = async (id) => {
    try {
      const authData = localStorage.getItem('360cleaning_auth');
      const token = authData ? JSON.parse(authData).token : '';

      await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      removeInvoice(id);
    } catch (error) {
      removeInvoice(id);
    }
  };

  const sendInvoiceEmail = async (invoice) => {
    setSendingEmail(invoice.id);
    try {
      const authData = localStorage.getItem('360cleaning_auth');
      const token = authData ? JSON.parse(authData).token : '';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      setSendingEmail(null);
    } catch (error) {
      console.error('Send email error:', error);
      setSendingEmail(null);
    }
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    updateInvoiceStatus(invoiceId, newStatus);
    setStatusDropdown(null);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Invoices & Payments</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Track your revenue and accept online payments
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4">
                <SkeletonTable rows={1} cols={1} theme={theme} />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <SkeletonTable rows={8} cols={6} theme={theme} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invoices & Payments</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your revenue and accept online payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {publishableKey && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm">
              <CreditCard className="h-4 w-4" />
              Stripe Ready
            </div>
          )}
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
          >
            {showCreateForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${totalRevenue.toFixed(2)}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>${pendingAmount.toFixed(2)}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>${overdueAmount.toFixed(2)}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{invoices.length}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreateForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Invoice
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormErrors({});
                }}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <input
                  value={newInvoice.client}
                  onChange={(e) => {
                    setNewInvoice({...newInvoice, client: e.target.value});
                    if (formErrors.client) setFormErrors({...formErrors, client: null});
                  }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition-colors ${formErrors.client ? 'border-red-400' : ''}`}
                  placeholder="Client Name *"
                />
                {formErrors.client && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.client}
                  </p>
                )}
              </div>
              <div>
                <input
                  value={newInvoice.email}
                  onChange={(e) => {
                    setNewInvoice({...newInvoice, email: e.target.value});
                    if (formErrors.email) setFormErrors({...formErrors, email: null});
                  }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition-colors ${formErrors.email ? 'border-red-400' : ''}`}
                  placeholder="Email *"
                  type="email"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <input
                  value={newInvoice.amount}
                  onChange={(e) => {
                    setNewInvoice({...newInvoice, amount: e.target.value});
                    if (formErrors.amount) setFormErrors({...formErrors, amount: null});
                  }}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition-colors ${formErrors.amount ? 'border-red-400' : ''}`}
                  placeholder="Amount ($) *"
                  type="number"
                  step="0.01"
                />
                {formErrors.amount && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.amount}
                  </p>
                )}
              </div>
              <div>
                <input
                  value={newInvoice.service}
                  onChange={(e) => setNewInvoice({...newInvoice, service: e.target.value})}
                  className={`w-full rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400 transition-colors`}
                  placeholder="Service Description"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                  <Check className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice List
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className={`pl-9 pr-4 py-2 rounded-xl text-sm appearance-none ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none focus:border-cyan-400 cursor-pointer`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-xs uppercase tracking-wider`}>
                  <th className="text-left pb-3 font-semibold">Invoice</th>
                  <th className="text-left pb-3 font-semibold">Client</th>
                  <th className="text-left pb-3 font-semibold">Amount</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-left pb-3 font-semibold">Due Date</th>
                  <th className="text-left pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedInvoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    className={`${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}
                  >
                    <td className="py-4">
                      <span className="font-mono text-sm font-semibold text-cyan-400">{invoice.id}</span>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold">{invoice.client}</p>
                        <p className={`text-sm flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Mail className="h-3 w-3" />
                          {invoice.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-lg">${parseFloat(invoice.amount || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <StatusBadge
                          status={invoice.status}
                          onClick={() => setStatusDropdown(statusDropdown === invoice.id ? null : invoice.id)}
                          theme={theme}
                        />
                        {statusDropdown === invoice.id && (
                          <StatusDropdown
                            currentStatus={invoice.status}
                            onSelect={(status) => handleStatusChange(invoice.id, status)}
                            onClose={() => setStatusDropdown(null)}
                            theme={theme}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <p className={invoice.status === 'overdue' ? 'text-red-400 font-medium' : ''}>
                        {invoice.due_date || invoice.dueDate || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {invoice.status !== 'paid' && (
                          <>
                            {publishableKey && (
                              <Button
                                onClick={() => handlePayment(invoice)}
                                className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm px-3 py-1.5"
                              >
                                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                                Pay
                              </Button>
                            )}
                            <Button
                              onClick={() => handleStatusChange(invoice.id, 'paid')}
                              className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm px-3 py-1.5"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Mark Paid
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => sendInvoiceEmail(invoice)}
                          disabled={sendingEmail === invoice.id}
                          className={`rounded-lg text-sm px-3 py-1.5 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                          {sendingEmail === invoice.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm px-3 py-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedInvoices.map(invoice => (
              <div
                key={invoice.id}
                className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} space-y-3`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm font-semibold text-cyan-400">{invoice.id}</p>
                    <p className="font-semibold">{invoice.client}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{invoice.email}</p>
                  </div>
                  <span className="font-bold text-lg">${parseFloat(invoice.amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <StatusBadge
                      status={invoice.status}
                      onClick={() => setStatusDropdown(statusDropdown === invoice.id ? null : invoice.id)}
                      theme={theme}
                    />
                    {statusDropdown === invoice.id && (
                      <StatusDropdown
                        currentStatus={invoice.status}
                        onSelect={(status) => handleStatusChange(invoice.id, status)}
                        onClose={() => setStatusDropdown(null)}
                        theme={theme}
                      />
                    )}
                  </div>
                  <p className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400 font-medium' : ''}`}>
                    {invoice.due_date || invoice.dueDate || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  {invoice.status !== 'paid' && (
                    <>
                      {publishableKey && (
                        <Button
                          onClick={() => handlePayment(invoice)}
                          className="flex-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm py-2"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                      )}
                      <Button
                        onClick={() => handleStatusChange(invoice.id, 'paid')}
                        className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-sm py-2"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Paid
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => sendInvoiceEmail(invoice)}
                    disabled={sendingEmail === invoice.id}
                    className={`flex-1 rounded-lg text-sm py-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}
                  >
                    {sendingEmail === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => deleteInvoice(invoice.id)}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm py-2 px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {paginatedInvoices.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="No invoices found"
              description={filterStatus !== 'all' ? `No ${filterStatus} invoices at the moment.` : 'Create your first invoice to start accepting payments.'}
              action={filterStatus === 'all' ? 'Create Invoice' : null}
              onAction={filterStatus === 'all' ? () => setShowCreateForm(true) : null}
            />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing {(pagination.page - 1) * pagination.perPage + 1} to {Math.min(pagination.page * pagination.perPage, filteredInvoices.length)} of {filteredInvoices.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className={`rounded-lg px-3 py-1.5 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {pagination.page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === totalPages}
                  className={`rounded-lg px-3 py-1.5 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'} rounded-2xl p-6 max-w-md w-full border shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pay Invoice
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Invoice</span>
                <span className="font-mono font-bold">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Client</span>
                <span className="font-medium">{selectedInvoice.client}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Amount</span>
                <span className="text-2xl font-black text-emerald-400">${parseFloat(selectedInvoice.amount || 0).toFixed(2)}</span>
              </div>
            </div>

            {publishableKey ? (
              <Button
                onClick={processPayment}
                disabled={paymentLoading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-4 text-lg font-bold"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay with Card
                  </>
                )}
              </Button>
            ) : (
              <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-semibold">Stripe Not Configured</p>
                </div>
                <p className="text-sm">Add STRIPE_PUBLISHABLE_KEY to your environment variables</p>
              </div>
            )}

            <div className={`mt-4 p-3 rounded-xl flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-slate-400">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;