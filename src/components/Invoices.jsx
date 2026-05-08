import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const Invoices = ({ theme = 'dark' }) => {
  const { invoices, addInvoice, updateInvoiceStatus, removeInvoice } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: '', email: '', amount: '', service: '' });

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

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    addInvoice({
      client: newInvoice.client,
      email: newInvoice.email,
      amount: parseFloat(newInvoice.amount),
      service: newInvoice.service
    });
    setNewInvoice({ client: '', email: '', amount: '', service: '' });
    setShowCreateForm(false);
  };

  const deleteInvoice = (id) => {
    if (confirm('Delete this invoice?')) {
      removeInvoice(id);
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Invoices & Payments</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your revenue and send invoices
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
        >
          {showCreateForm ? 'Cancel' : '+ Create Invoice'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${totalRevenue}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Revenue</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>${pendingAmount}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Pending</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>${overdueAmount}</p>
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
                      <span className="font-bold text-lg">${invoice.amount}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)} {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <p className={invoice.status === 'overdue' ? 'text-red-400' : ''}>
                        {invoice.dueDate}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {invoice.status !== 'paid' && (
                          <Button 
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                            className="bg-green-400/20 text-green-400 hover:bg-green-400/30 rounded-lg text-sm"
                          >
                            ✅ Paid
                          </Button>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
