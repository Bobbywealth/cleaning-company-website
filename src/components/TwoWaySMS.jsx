import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

export default function TwoWaySMS({ isDarkMode }) {
  const [inboundMessages, setInboundMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/sms/inbound', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInboundMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const getKeywordColor = (keyword) => {
    const colors = {
      'STOP': 'bg-red-500/20 text-red-500',
      'START': 'bg-green-500/20 text-green-500',
      'DONE': 'bg-blue-500/20 text-blue-500',
      'COMPLETE': 'bg-blue-500/20 text-blue-500',
      'CONFIRM': 'bg-green-500/20 text-green-500',
      'RESCHEDULE': 'bg-orange-500/20 text-orange-500',
    };
    return colors[keyword] || 'bg-gray-500/20 text-gray-500';
  };

  const filteredMessages = inboundMessages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'unprocessed') return !msg.processed;
    if (filter === 'keyword') return msg.keyword;
    return true;
  });

  const stats = {
    total: inboundMessages.length,
    processed: inboundMessages.filter(m => m.processed).length,
    unprocessed: inboundMessages.filter(m => !m.processed).length,
    keywords: [...new Set(inboundMessages.map(m => m.keyword).filter(Boolean))].length
  };

  return (
    <div className="space-y-6">
      <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Two-Way SMS Center
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-cyan-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Messages</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Processed</span>
          </div>
          <span className={`text-2xl font-bold text-green-500`}>{stats.processed}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-orange-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Unprocessed</span>
          </div>
          <span className={`text-2xl font-bold text-orange-500`}>{stats.unprocessed}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-purple-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Keywords Used</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.keywords}</span>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Supported Keywords
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { keyword: 'STOP', desc: 'Unsubscribe', color: 'bg-red-500' },
            { keyword: 'START', desc: 'Resubscribe', color: 'bg-green-500' },
            { keyword: 'DONE', desc: 'Job complete', color: 'bg-blue-500' },
            { keyword: 'CONFIRM', desc: 'Confirm apt', color: 'bg-green-500' },
            { keyword: 'RESCHEDULE', desc: 'Reschedule request', color: 'bg-orange-500' },
          ].map(k => (
            <div key={k.keyword} className={`${k.color} rounded-lg p-3 text-white text-center`}>
              <span className="font-bold">{k.keyword}</span>
              <p className="text-xs opacity-80 mt-1">{k.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Inbound Messages
          </h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
            >
              <option value="all">All Messages</option>
              <option value="unprocessed">Unprocessed</option>
              <option value="keyword">Has Keyword</option>
            </select>
            <button
              onClick={fetchMessages}
              className={`px-3 py-1.5 text-sm rounded-lg ${isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="p-4 hover:bg-opacity-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <Phone size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{msg.from_number}</span>
                      {msg.keyword && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getKeywordColor(msg.keyword)}`}>
                          {msg.keyword}
                        </span>
                      )}
                      {msg.processed ? (
                        <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle size={12} /> Processed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-500"><Clock size={12} /> Pending</span>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{msg.message}</p>
                    {msg.response_sent && (
                      <div className={`mt-2 p-2 rounded-lg text-sm ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                        <span className="font-medium">Auto-response:</span> {msg.response_sent}
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <p className={`px-4 py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No messages found
          </p>
        )}
      </div>
    </div>
  );
}