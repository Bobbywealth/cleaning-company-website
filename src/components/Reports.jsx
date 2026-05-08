import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

const Reports = ({ theme = 'dark' }) => {
  const { leads, jobs } = useApp();
  const [dateRange, setDateRange] = useState('30');

  const convertedLeads = leads.filter(l => l.status === 'Converted');
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0;

  // Calculate weekly data for chart
  const generateWeeklyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, i) => ({
      week,
      leads: Math.floor(Math.random() * 10) + 5,
      jobs: Math.floor(Math.random() * 8) + 3,
      revenue: Math.floor(Math.random() * 2000) + 1000
    }));
  };

  const weeklyData = generateWeeklyData();

  // Calculate service breakdown
  const serviceBreakdown = [
    { service: 'Standard Clean', count: 45, percentage: 35, color: 'bg-cyan-400' },
    { service: 'Deep Clean', count: 32, percentage: 25, color: 'bg-blue-400' },
    { service: 'Move In/Out', count: 22, percentage: 17, color: 'bg-purple-400' },
    { service: 'Office Clean', count: 18, percentage: 14, color: 'bg-green-400' },
    { service: 'Other', count: 11, percentage: 9, color: 'bg-yellow-400' },
  ];

  // Top performing days
  const topDays = [
    { day: 'Tuesday', jobs: 28 },
    { day: 'Wednesday', jobs: 24 },
    { day: 'Thursday', jobs: 22 },
    { day: 'Saturday', jobs: 18 },
    { day: 'Monday', jobs: 15 },
  ];

  // Calculate metrics
  const avgJobsPerDay = 12;
  const avgRevenuePerJob = 185;
  const totalRevenue = convertedLeads.length * avgRevenuePerJob * 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Business performance insights
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className={`px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} border outline-none`}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{leads.length}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Leads</p>
            <p className="text-xs text-green-400 mt-1">+12% vs last period</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{conversionRate}%</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Conversion Rate</p>
            <p className="text-xs text-green-400 mt-1">+5% vs last period</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{jobs.length}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Jobs Completed</p>
            <p className="text-xs text-green-400 mt-1">+8% vs last period</p>
          </CardContent>
        </Card>
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>${totalRevenue}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Revenue</p>
            <p className="text-xs text-green-400 mt-1">+15% vs last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">📈 Weekly Performance</h3>
            <div className="space-y-3">
              {weeklyData.map((week, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{week.week}</span>
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                      {week.leads} leads • {week.jobs} jobs • ${week.revenue}
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: `${(week.revenue / 4000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">🍰 Service Breakdown</h3>
            <div className="space-y-3">
              {serviceBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1">{item.service}</span>
                  <span className="font-bold">{item.count}</span>
                  <div className={`w-20 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Days */}
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">📅 Busiest Days</h3>
            <div className="space-y-3">
              {topDays.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-slate-950' :
                    idx === 1 ? 'bg-slate-300 text-slate-950' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1">{item.day}</span>
                  <span className="font-bold">{item.jobs} jobs</span>
                  <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div 
                      className="h-2 rounded-full bg-cyan-400"
                      style={{ width: `${(item.jobs / 28) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">⚡ Performance Metrics</h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center">
                  <span>Avg Jobs per Day</span>
                  <span className="font-bold text-2xl">{avgJobsPerDay}</span>
                </div>
                <div className={`mt-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="h-2 w-3/4 rounded-full bg-cyan-400" />
                </div>
              </div>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center">
                  <span>Avg Revenue per Job</span>
                  <span className="font-bold text-2xl">${avgRevenuePerJob}</span>
                </div>
                <div className={`mt-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="h-2 w-2/3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center">
                  <span>Customer Satisfaction</span>
                  <span className="font-bold text-2xl">98%</span>
                </div>
                <div className={`mt-2 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div className="h-2 w-[98%] rounded-full bg-yellow-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <h3 className="font-bold mb-4">📥 Export Reports</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Exporting leads report as CSV...')}
              className={`p-4 rounded-xl border transition ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <span className="text-2xl mb-2 block">📊</span>
              <p className="font-semibold">Leads Report</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Download as CSV</p>
            </button>
            <button 
              onClick={() => alert('Exporting jobs report as CSV...')}
              className={`p-4 rounded-xl border transition ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <span className="text-2xl mb-2 block">📅</span>
              <p className="font-semibold">Jobs Report</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Download as CSV</p>
            </button>
            <button 
              onClick={() => alert('Generating revenue report PDF...')}
              className={`p-4 rounded-xl border transition ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <span className="text-2xl mb-2 block">💰</span>
              <p className="font-semibold">Revenue Report</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Download as PDF</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
