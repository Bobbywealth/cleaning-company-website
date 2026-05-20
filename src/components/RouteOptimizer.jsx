import { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, Users, Route, ChevronRight, AlertCircle } from 'lucide-react';

export default function RouteOptimizer({ isDarkMode }) {
  const [routes, setRoutes] = useState({ routes: [], total_jobs: 0 });
  const [zones, setZones] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [expandedRoute, setExpandedRoute] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    optimizeRoutes();
  }, [selectedDate]);

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/routes/zones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setZones(data);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const optimizeRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/routes/optimize?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error('Failed to optimize routes:', err);
    }
    setLoading(false);
  };

  const getZoneColor = (index) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Route Optimization
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
          />
          <button
            onClick={optimizeRoutes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? <Clock size={18} className="animate-spin" /> : <Route size={18} />}
            Optimize Routes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-cyan-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total Routes</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{routes.routes?.length || 0}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-orange-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Jobs to Assign</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{routes.total_jobs || 0}</span>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-green-500" size={22} />
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Active Zones</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{zones.length}</span>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-5 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Crew Zone Assignments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone, idx) => (
            <div key={zone.id} className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`${getZoneColor(idx)} w-3 h-3 rounded-full`}></div>
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{zone.zone_name}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Crew</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{zone.crew_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Zip Codes</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>
                  {zone.zip_codes?.length ? zone.zip_codes.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Jobs Today</span>
                <span className="text-cyan-500 font-semibold">{zone.assigned_jobs || 0}</span>
              </div>
            </div>
          ))}
        </div>
        {zones.length === 0 && (
          <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No zone assignments found. Add crew zones in the Automation tab.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Optimized Routes for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h3>

        {routes.routes?.length === 0 && (
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-8 text-center`}>
            <MapPin className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={40} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No scheduled jobs for this date</p>
          </div>
        )}

        {routes.routes?.map((route, idx) => (
          <div key={idx} className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden`}>
            <button
              onClick={() => setExpandedRoute(expandedRoute === idx ? null : idx)}
              className="w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`${getZoneColor(idx)} w-10 h-10 rounded-full flex items-center justify-center`}>
                  <Truck size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{route.zone}</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {route.job_count} jobs | ~{Math.round(route.estimated_duration / 60)}h {route.estimated_duration % 60}m estimated
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'} transition-transform ${expandedRoute === idx ? 'rotate-90' : ''}`} />
            </button>

            {expandedRoute === idx && (
              <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                {route.jobs.map((job, jobIdx) => (
                  <div key={job.id} className={`p-4 ${jobIdx > 0 ? `border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}` : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`${getZoneColor(idx)} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                        {jobIdx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.client}</h5>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{job.service}</span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {job.address || job.email || 'No address'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Phone: {job.phone || 'N/A'}
                          </span>
                          {job.crew_id && (
                            <span className="text-xs text-cyan-500">
                              Assigned to Crew #{job.crew_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}