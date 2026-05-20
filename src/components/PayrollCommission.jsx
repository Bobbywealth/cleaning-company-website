import { useState, useEffect } from 'react';
import { DollarSign, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PayrollCommission({ isDarkMode }) {
  const [commissions, setCommissions] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ crew_id: '', job_id: '', commission_rate: 0.10 });

  useEffect(() => {
    fetchCommissions();
    fetchPayrollSummary();
    fetchCrew();
    fetchJobs();
  }, []);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/commissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCommissions(data);
    } catch (err) {
      console.error('Failed to fetch commissions:', err);
    }
  };

  const fetchPayrollSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payroll/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPayrollSummary(data);
    } catch (err) {
      console.error('Failed to fetch payroll summary:', err);
    }
  };

  const fetchCrew = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/crew', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCrewMembers(data);
    } catch (err) {
      console.error('Failed to fetch crew:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/commissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      setFormData({ crew_id: '', job_id: '', commission_rate: 0.10 });
      fetchCommissions();
      fetchPayrollSummary();
    } catch (err) {
      console.error('Failed to calculate commission:', err);
    }
  };

  const markAsPaid = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/commissions/${id}/pay`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCommissions();
      fetchPayrollSummary();
    } catch (err) {
      console.error('Failed to mark commission as paid:', err);
    }
  };

  const totalPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  const totalPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Commission & Payroll
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Calculate Commission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-cyan-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Crew Members</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{crewMembers.length}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-orange-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Pending</span>
          </div>
          <span className={`text-2xl font-bold text-orange-500`}>${totalPending.toFixed(2)}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Paid Out</span>
          </div>
          <span className={`text-2xl font-bold text-green-500`}>${totalPaid.toFixed(2)}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Commissions</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${(totalPending + totalPaid).toFixed(2)}</span>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payroll Summary by Crew Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payrollSummary.map(member => (
            <div key={member.id} className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{member.name}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Pending</span>
                <span className="text-orange-500 font-semibold">${parseFloat(member.total_commissions || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Jobs</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{parseInt(member.pending_count || 0)} pending, {parseInt(member.paid_count || 0)} paid</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Calculate Commission
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={formData.crew_id}
              onChange={(e) => setFormData({ ...formData, crew_id: parseInt(e.target.value) })}
              required
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="">Select Crew Member</option>
              {crewMembers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={formData.job_id}
              onChange={(e) => setFormData({ ...formData, job_id: parseInt(e.target.value) })}
              required
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="">Select Job</option>
              {jobs.filter(j => j.status === 'Completed').map(j => <option key={j.id} value={j.id}>{j.client} - {j.service}</option>)}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="Commission Rate (e.g., 0.10)"
              value={formData.commission_rate}
              onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                Calculate
              </button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-6 py-2 ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg`}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
        <div className="p-5 border-b border-gray-100">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Commission History</h3>
        </div>
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Crew Member</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Job ID</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Amount</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pay Period</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.id} className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{commission.crew_name || `Crew #${commission.crew_id}`}</td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>#{commission.job_id}</td>
                <td className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(commission.amount || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    commission.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {commission.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {commission.status}
                  </span>
                </td>
                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{commission.pay_period || '-'}</td>
                <td className="px-4 py-3 text-right">
                  {commission.status === 'pending' && (
                    <button onClick={() => markAsPaid(commission.id)} className="text-green-500 hover:text-green-600 text-sm font-medium">
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && (
          <p className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No commissions recorded yet</p>
        )}
      </div>
    </div>
  );
}