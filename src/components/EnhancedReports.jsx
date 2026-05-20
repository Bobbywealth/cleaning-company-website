import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Clock
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EnhancedReports = ({ theme = 'dark' }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const chartRef = useRef(null);

  const fetchStats = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('360cleaning_auth');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/extended`, {
        headers: { 'Authorization': `Bearer ${JSON.parse(token).token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartColors = {
    cyan: theme === 'dark' ? '#22d3ee' : '#06b6d4',
    green: theme === 'dark' ? '#4ade80' : '#22c55e',
    yellow: theme === 'dark' ? '#facc15' : '#eab308',
    red: theme === 'dark' ? '#f87171' : '#ef4444',
    purple: theme === 'dark' ? '#c084fc' : '#a855f7',
    slate: theme === 'dark' ? '#94a3b8' : '#64748b',
    bg: theme === 'dark' ? '#1e293b' : '#f8fafc',
    grid: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    text: theme === 'dark' ? '#e2e8f0' : '#1e293b'
  };

  const revenueChartData = {
    labels: stats?.revenueByDay?.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueByDay?.map(d => parseFloat(d.revenue) || 0) || [],
        borderColor: chartColors.cyan,
        backgroundColor: `${chartColors.cyan}20`,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const jobsChartData = {
    labels: stats?.jobsByDay?.map(d => new Date(d.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'Jobs',
        data: stats?.jobsByDay?.map(d => d.jobs) || [],
        backgroundColor: chartColors.green,
        borderRadius: 6
      }
    ]
  };

  const leadSourceData = {
    labels: stats?.leadSources?.map(s => s.source) || [],
    datasets: [
      {
        data: stats?.leadSources?.map(s => s.count) || [],
        backgroundColor: [
          chartColors.cyan,
          chartColors.green,
          chartColors.yellow,
          chartColors.purple,
          chartColors.red
        ],
        borderWidth: 0
      }
    ]
  };

  const serviceBreakdownData = {
    labels: stats?.serviceBreakdown?.map(s => s.service) || [],
    datasets: [
      {
        label: 'Jobs by Service',
        data: stats?.serviceBreakdown?.map(s => s.count) || [],
        backgroundColor: chartColors.cyan,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.slate }
      },
      y: {
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.slate }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: chartColors.text }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonCard className="h-10 w-64" />
          <SkeletonCard className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} className="h-24" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Business performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchStats}
            variant="ghost"
            className={`rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20' : 'bg-gradient-to-br from-green-50 to-white border-green-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <DollarSign className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              ${stats?.revenue?.total?.toLocaleString() || 0}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Revenue</p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <Users className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {stats?.leads?.total || 0}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Leads</p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <Briefcase className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats?.jobs?.total || 0}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Jobs</p>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-white border-yellow-200'} rounded-2xl`}>
          <CardContent className="p-4 text-center">
            <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <p className={`text-3xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {stats?.leads?.conversionRate || 0}%
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Lead Conversion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Revenue Trend
            </h3>
            <div className="h-64">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Briefcase className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              Jobs Completed
            </h3>
            <div className="h-64">
              <Bar data={jobsChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              Lead Sources
            </h3>
            <div className="h-64">
              <Doughnut data={leadSourceData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Briefcase className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Services Breakdown
            </h3>
            <div className="h-64">
              <Bar data={serviceBreakdownData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Crew Overview</h3>
            <div className="space-y-4">
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-400/10' : 'bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Available</span>
                  <span className="text-2xl font-black text-green-400">{stats?.crew?.available || 0}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-yellow-400/10' : 'bg-yellow-50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>On Job</span>
                  <span className="text-2xl font-black text-yellow-400">{stats?.crew?.busy || 0}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-cyan-400/10' : 'bg-cyan-50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Total Crew</span>
                  <span className="text-2xl font-black text-cyan-400">{stats?.crew?.total || 0}</span>
                </div>
              </div>
            </div>

            <h3 className="font-bold mt-6 mb-4">Recurring Revenue</h3>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-purple-400/10' : 'bg-purple-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Active Recurring</span>
                <span className="text-2xl font-black text-purple-400">{stats?.recurring?.active || 0}</span>
              </div>
              <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {stats?.recurring?.total || 0} total recurring clients
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
        <CardContent className="p-4">
          <h3 className="font-bold mb-4">Lead Funnel</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className={`w-20 text-right text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>New</div>
              <div className="flex-1 h-8 rounded-lg bg-blue-400/20 overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${stats?.leads?.total ? (stats.leads.new / stats.leads.total) * 100 : 0}%` }}
                />
              </div>
              <div className="w-16 text-left font-bold text-blue-400">{stats?.leads?.new || 0}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-20 text-right text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Contacted</div>
              <div className="flex-1 h-8 rounded-lg bg-yellow-400/20 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${stats?.leads?.total ? (stats.leads.contacted / stats.leads.total) * 100 : 0}%` }}
                />
              </div>
              <div className="w-16 text-left font-bold text-yellow-400">{stats?.leads?.contacted || 0}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-20 text-right text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Converted</div>
              <div className="flex-1 h-8 rounded-lg bg-green-400/20 overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-500"
                  style={{ width: `${stats?.leads?.total ? (stats.leads.converted / stats.leads.total) * 100 : 0}%` }}
                />
              </div>
              <div className="w-16 text-left font-bold text-green-400">{stats?.leads?.converted || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedReports;