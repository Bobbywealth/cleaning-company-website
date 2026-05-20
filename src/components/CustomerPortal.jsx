import { useState, useEffect } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, Calendar, DollarSign, CheckCircle, Clock, Home } from 'lucide-react';

export default function CustomerPortal({ isDarkMode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', customer_name: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('customer_token', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        fetchCustomerData(data.token);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Registration successful! Please check your email to verify your account.');
        setView('login');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed');
    }
    setLoading(false);
  };

  const fetchCustomerData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [jobsRes, invoicesRes] = await Promise.all([
        fetch('/api/portal/jobs', { headers }),
        fetch('/api/portal/invoices', { headers })
      ]);
      setJobs(await jobsRes.json());
      setInvoices(await invoicesRes.json());
    } catch (err) {
      console.error('Failed to fetch customer data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    setIsLoggedIn(false);
    setUser(null);
    setJobs([]);
    setInvoices([]);
    setFormData({ email: '', password: '', customer_name: '', phone: '' });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-500/20 text-green-500',
      'Scheduled': 'bg-blue-500/20 text-blue-500',
      'Pending': 'bg-orange-500/20 text-orange-500',
      'Confirmed': 'bg-cyan-500/20 text-cyan-500',
      'Cancelled': 'bg-red-500/20 text-red-500',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home size={32} className="text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Customer Portal
            </h2>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {view === 'login' ? 'Sign in to view your scheduled services' : 'Create an account to get started'}
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Clock size={18} className="animate-spin" /> : <LogIn size={18} />}
                Sign In
              </button>
              <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                New customer? <button type="button" onClick={() => setView('register')} className="text-cyan-500 hover:underline">Create account</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="John Smith"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-cyan-500`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Clock size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Create Account
              </button>
              <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an account? <button type="button" onClick={() => setView('login')} className="text-cyan-500 hover:underline">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome, {user?.customer_name || user?.email}
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Manage your services and invoices</p>
        </div>
        <button
          onClick={handleLogout}
          className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-cyan-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Your Jobs</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{jobs.length}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Completed</span>
          </div>
          <span className={`text-2xl font-bold text-green-500`}>{jobs.filter(j => j.status === 'Completed').length}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-orange-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Invoiced</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-5 border-b border-gray-100">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Scheduled Services</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.service}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {job.date}
                </p>
                {job.notes && (
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.notes}</p>
                )}
              </div>
            ))}
            {jobs.length === 0 && (
              <p className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No scheduled services</p>
            )}
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-5 border-b border-gray-100">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invoice History</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invoice #{invoice.id}</span>
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${parseFloat(invoice.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Due: {invoice.due_date || 'N/A'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No invoices</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}