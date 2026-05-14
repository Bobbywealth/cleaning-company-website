import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { loadStripe } from '@stripe/stripe-js';

const Invoices = ({ theme = 'dark' }) => {
  const { invoices, addInvoice, updateInvoiceStatus, removeInvoice, updateInvoice } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [newInvoice, setNewInvoice] = useState({ client: '', email: '', amount: '', service: '' });

  // Load Stripe config on mount
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
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-400/20 text-green-400';
      case 'pending': return 'bg-yellow-400/20 text-yellow-400';
      case 'overdue': return 'bg-red-400/20 text-red-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return '✅';
      case 'pending': return '⏳';
      case 'overdue': return '⚠️';
      default: return '📄';
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
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
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
  };

  const handlePayment = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedInvoice || !stripePromise) {
      alert('Stripe not configured. Please add your Stripe API keys.');
      return;
    }

    setPaymentLoading(true);

    try {
      // Get token from localStorage
      const authData = localStorage.getItem('360cleaning_auth');
      const token = authData ? JSON.parse(authData).token : '';

      // Create payment intent
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
        alert(`Payment error: ${data.error}`);
        setPaymentLoading(false);
        return;
      }

      // Use Stripe.js to confirm payment
      const stripe = await stripePromise;
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/#/invoices',
        },
        redirect: 'if_required',
      });

      if (error) {
        alert(error.message);
        setPaymentLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update invoice status to paid
        updateInvoiceStatus(selectedInvoice.id, 'paid');
        setShowPaymentModal(false);
        alert('Payment successful! Invoice marked as paid.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }

    setPaymentLoading(false);
  };

  const deleteInvoice = async (id) => {
    if (confirm('Delete this invoice?')) {
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
        removeInvoice(id); // Still remove locally
      }
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invoices & Payments</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your revenue and accept online payments
          </p>
        </div>
        <div className="flex gap-2">
          {publishableKey && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-400/20 text-green-400 text-sm">
              💳 Stripe Ready
            </div>
          )}
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
          >
            {showCreateForm ? 'Cancel' : '+ Create Invoice'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${totalRevenue.toFixed(2)}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Revenue</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>${pendingAmount.toFixed(2)}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Pending</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>${overdueAmount.toFixed(2)}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Overdue</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{invoices.length}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Invoice Form */}
      {showCreateForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Create New Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                value={newInvoice.client}
                onChange={(e) => setNewInvoice({...newInvoice, client: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Client Name"
                required
              />
              <input
                value={newInvoice.email}
                onChange={(e) => setNewInvoice({...newInvoice, email: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Email"
                type="email"
                required
              />
              <input
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Amount ($)"
                type="number"
                step="0.01"
                required
              />
              <input
                value={newInvoice.service}
                onChange={(e) => setNewInvoice({...newInvoice, service: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Service Description"
              />
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl">
                ✅ Create Invoice
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                  <th className="text-left pb-3 font-medium">Invoice</th>
                  <th className="text-left pb-3 font-medium">Client</th>
                  <th className="text-left pb-3 font-medium">Amount</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Due Date</th>
                  <th className="text-left pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} className={`border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
                    <td className="py-4">
                      <span className="font-mono font-bold">{invoice.id}</span>
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-semibold">{invoice.client}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{invoice.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-lg">${parseFloat(invoice.amount || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className={invoice.status === 'overdue' ? 'text-red-400' : ''}>
                        {invoice.due_date || invoice.dueDate || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {invoice.status !== 'paid' && (
                          <>
                            {publishableKey && (
                              <Button 
                                onClick={() => handlePayment(invoice)}
                                className="bg-purple-400 text-white hover:bg-purple-500 rounded-lg text-sm"
                              >
                                💳 Pay Now
                              </Button>
                            )}
                            <Button 
                              onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                              className="bg-green-400/20 text-green-400 hover:bg-green-400/30 rounded-lg text-sm"
                            >
                              ✅ Paid
                            </Button>
                          </>
                        )}
                        <Button 
                          onClick={() => alert(`Sending invoice ${invoice.id} to ${invoice.email}`)}
                          className={`rounded-lg text-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                          📧 Send
                        </Button>
                        <Button 
                          onClick={() => deleteInvoice(invoice.id)}
                          className="bg-red-400/20 text-red-400 hover:bg-red-400/30 rounded-lg text-sm"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <p className="text-4xl mb-4">📄</p>
              <p>No invoices yet</p>
              <p className="text-sm mt-2">Create an invoice to start accepting payments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">💳 Pay Invoice</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>
            
            <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <span>Invoice:</span>
                <span className="font-mono font-bold">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Client:</span>
                <span>{selectedInvoice.client}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Amount:</span>
                <span className="text-2xl font-black text-green-400">${parseFloat(selectedInvoice.amount || 0).toFixed(2)}</span>
              </div>
            </div>

            {publishableKey ? (
              <Button 
                onClick={processPayment}
                disabled={paymentLoading}
                className="w-full bg-purple-400 hover:bg-purple-500 text-white rounded-xl py-4 text-lg font-bold"
              >
                {paymentLoading ? '⏳ Processing...' : '💳 Pay with Card'}
              </Button>
            ) : (
              <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                <p className="font-semibold">⚠️ Stripe Not Configured</p>
                <p className="text-sm mt-1">Add STRIPE_PUBLISHABLE_KEY to your environment variables</p>
              </div>
            )}

            <div className={`mt-4 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <p className="text-xs text-center text-slate-400">
                🔒 Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
