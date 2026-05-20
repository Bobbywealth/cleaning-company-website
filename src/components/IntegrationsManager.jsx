import { useState, useEffect } from 'react';
import { Link2, Plus, RefreshCw, Trash2, CheckCircle, XCircle, Calendar, BookOpen, Zap } from 'lucide-react';

const integrationServices = [
  { name: 'QuickBooks', icon: BookOpen, description: 'Sync invoices, expenses, and payroll', color: 'bg-green-500' },
  { name: 'Google Calendar', icon: Calendar, description: 'Two-way sync for key dates and schedules', color: 'bg-blue-500' },
  { name: 'Xero', icon: BookOpen, description: 'Accounting and inventory sync', color: 'bg-cyan-500' },
  { name: 'Zapier', icon: Zap, description: 'Connect to 3000+ apps via webhooks', color: 'bg-orange-500' },
];

export default function IntegrationsManager({ isDarkMode }) {
  const [integrations, setIntegrations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ service_name: '', access_token: '', refresh_token: '', expires_at: '' });
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/integrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      setFormData({ service_name: '', access_token: '', refresh_token: '', expires_at: '' });
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to add integration:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this integration?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to delete integration:', err);
    }
  };

  const handleSync = async (id) => {
    setSyncing(id);
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/integrations/${id}/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await new Promise(r => setTimeout(r, 1000));
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to sync integration:', err);
    }
    setSyncing(null);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to toggle integration:', err);
    }
  };

  const getServiceInfo = (name) => integrationServices.find(s => s.name === name) || { icon: Link2, color: 'bg-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Integrations & Sync
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus size={18} /> Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {integrationServices.map((service) => {
          const connected = integrations.find(i => i.service_name === service.name);
          const Icon = service.icon;
          return (
            <div key={service.name} className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm border ${connected?.is_active ? 'border-green-500/50' : isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`${service.color} p-2 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</h3>
                  {connected?.is_active ? (
                    <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={10} /> Connected</span>
                  ) : (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Not connected</span>
                  )}
                </div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>{service.description}</p>
              {connected ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(connected.id)}
                    disabled={syncing === connected.id}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} disabled:opacity-50`}
                  >
                    {syncing === connected.id ? <RefreshCw size={14} className="animate-spin inline" /> : 'Sync'} Now
                  </button>
                  <button
                    onClick={() => toggleActive(connected.id, connected.is_active)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${connected.is_active ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}
                  >
                    {connected.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setFormData({ ...formData, service_name: service.name }); setShowForm(true); }}
                  className={`w-full px-3 py-1.5 text-sm rounded-lg border ${isDarkMode ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10' : 'border-cyan-500 text-cyan-600 hover:bg-cyan-50'}`}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Configure {formData.service_name || 'Integration'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              required
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="">Select Service</option>
              {integrationServices.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <input
              type="datetime-local"
              placeholder="Token Expires (optional)"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="text"
              placeholder="Access Token / API Key"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <input
              type="text"
              placeholder="Refresh Token (if applicable)"
              value={formData.refresh_token}
              onChange={(e) => setFormData({ ...formData, refresh_token: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">
                Save Integration
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
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Integrations</h3>
        </div>
        <table className="w-full">
          <thead className={isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Service</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last Sync</th>
              <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Created</th>
              <th className={`px-4 py-3 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => {
              const service = getServiceInfo(integration.service_name);
              const Icon = service.icon;
              return (
                <tr key={integration.id} className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`${service.color} p-1.5 rounded`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{integration.service_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      integration.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {integration.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}
                  </td>
                  <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(integration.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing === integration.id}
                      className="p-1.5 hover:text-cyan-500 disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={syncing === integration.id ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => handleDelete(integration.id)} className="p-1.5 hover:text-red-500 ml-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {integrations.length === 0 && (
          <p className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No integrations configured yet</p>
        )}
      </div>
    </div>
  );
}