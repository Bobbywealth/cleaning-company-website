import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const RecurringClients = ({ theme = 'dark' }) => {
  const { leads, jobs, createJob } = useApp();
  const [recurringClients, setRecurringClients] = useState([
    { id: 1, name: 'John Smith', phone: '(862) 555-1001', email: 'john@email.com', plan: 'premium', frequency: 'weekly', price: 180, nextDate: '2026-05-15', status: 'active' },
    { id: 2, name: 'Sarah Johnson', phone: '(862) 555-1002', email: 'sarah@email.com', plan: 'standard', frequency: 'biweekly', price: 150, nextDate: '2026-05-18', status: 'active' },
    { id: 3, name: 'Mike Davis', phone: '(862) 555-1003', email: 'mike@email.com', plan: 'basic', frequency: 'monthly', price: 200, nextDate: '2026-06-01', status: 'active' },
    { id: 4, name: 'Emily Wilson', phone: '(862) 555-1004', email: 'emily@email.com', plan: 'premium', frequency: 'weekly', price: 180, nextDate: '2026-05-20', status: 'paused' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', plan: 'standard', frequency: 'biweekly', price: '' });

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'premium': return 'bg-purple-400/20 text-purple-400';
      case 'standard': return 'bg-blue-400/20 text-blue-400';
      case 'basic': return 'bg-green-400/20 text-green-400';
      default: return 'bg-slate-400/20 text-slate-400';
    }
  };

  const getFrequencyIcon = (freq) => {
    switch (freq) {
      case 'weekly': return '📅📅';
      case 'biweekly': return '📅';
      case 'monthly': return '🗓️';
      default: return '📅';
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    const today = new Date();
    let nextDate = new Date(today);
    
    if (newClient.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (newClient.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    setRecurringClients([...recurringClients, {
      id: Date.now(),
      ...newClient,
      price: parseFloat(newClient.price),
      nextDate: nextDate.toISOString().split('T')[0],
      status: 'active'
    }]);
    setNewClient({ name: '', phone: '', email: '', plan: 'standard', frequency: 'biweekly', price: '' });
    setShowAddForm(false);
  };

  const togglePause = (id) => {
    setRecurringClients(recurringClients.map(client => 
      client.id === id ? { ...client, status: client.status === 'active' ? 'paused' : 'active' } : client
    ));
  };

  const scheduleJob = (client) => {
    const jobData = {
      client: client.name,
      service: `${client.plan.charAt(0).toUpperCase() + client.plan.slice(1)} Clean (Recurring)`,
      date: client.nextDate,
      phone: client.phone,
      email: client.email,
      recurring: true
    };
    createJob(jobData);
    alert(`Job scheduled for ${client.name} on ${client.nextDate}!`);
  };

  const activeClients = recurringClients.filter(c => c.status === 'active').length;
  const pausedClients = recurringClients.filter(c => c.status === 'paused').length;
  const monthlyRevenue = recurringClients.filter(c => c.status === 'active').reduce((sum, c) => {
    if (c.frequency === 'weekly') return sum + (c.price * 4);
    if (c.frequency === 'biweekly') return sum + (c.price * 2);
    return sum + c.price;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recurring Clients</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage subscription clients & auto-scheduling
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
        >
          {showAddForm ? 'Cancel' : '+ Add Recurring Client'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>${monthlyRevenue}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{activeClients}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Active</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>{pausedClients}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Paused</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{recurringClients.length}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card className={`${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Add Recurring Client</h3>
            <form onSubmit={handleAddClient} className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <input
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Client Name"
                required
              />
              <input
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Phone"
                required
              />
              <input
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Email"
                required
              />
              <select
                value={newClient.plan}
                onChange={(e) => setNewClient({...newClient, plan: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
              <select
                value={newClient.frequency}
                onChange={(e) => setNewClient({...newClient, frequency: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                value={newClient.price}
                onChange={(e) => setNewClient({...newClient, price: e.target.value})}
                className={`rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border px-4 py-2.5 outline-none focus:border-cyan-400`}
                placeholder="Price ($)"
                type="number"
                required
              />
              <Button type="submit" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl lg:col-span-6">
                ✅ Add Recurring Client
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Info */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { plan: 'basic', name: 'Basic', price: '$150-200/mo', features: 'Monthly deep clean' },
          { plan: 'standard', name: 'Standard', price: '$250-300/mo', features: 'Bi-weekly maintenance' },
          { plan: 'premium', name: 'Premium', price: '$500-700/mo', features: 'Weekly full service' },
        ].map(p => (
          <Card key={p.plan} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(p.plan)}`}>
                {p.name}
              </span>
              <p className="text-2xl font-bold mt-2">{p.price}</p>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{p.features}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recurring Clients Grid */}
      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <h3 className="font-bold mb-4">All Recurring Clients</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringClients.map(client => (
              <div 
                key={client.id}
                className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} ${
                  client.status === 'paused' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold">{client.name}</h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{client.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(client.plan)}`}>
                    {client.plan}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span>{getFrequencyIcon(client.frequency)} {client.frequency}</span>
                  <span className="font-bold text-lg">${client.price}</span>
                </div>

                <div className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  📅 Next: {client.nextDate}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => togglePause(client.id)}
                    className={`flex-1 rounded-lg text-sm ${
                      client.status === 'active'
                        ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                        : 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
                    }`}
                  >
                    {client.status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
                  </Button>
                  <Button 
                    onClick={() => scheduleJob(client)}
                    className="flex-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-lg text-sm"
                  >
                    📅 Schedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringClients;
