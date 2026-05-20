import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Download,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';

const Reports = ({ theme = 'dark' }) => {
  const { leads, jobs, invoices } = useApp();
  const [dateRange, setDateRange] = useState('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedDateInput, setFocusedDateInput] = useState(null);

  const convertedLeads = leads.filter(l => l.status === 'Converted');
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0;

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  
  const completedJobs = jobs.filter(j => j.status === 'Completed');
  const avgRevenuePerJob = completedJobs.length > 0 ? Math.round(totalRevenue / completedJobs.length) : 0;
  
  const daysInRange = parseInt(dateRange);
  const avgJobsPerDay = completedJobs.length > 0 ? (completedJobs.length / daysInRange).toFixed(1) : 0;

  const serviceCounts = {};
  leads.forEach(lead => {
    const service = lead.service || 'Other';
    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
  });
  
  const serviceBreakdown = Object.entries(serviceCounts).map(([service, count], idx) => ({
    service,
    count,
    percentage: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0,
    color: ['bg-cyan-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400', 'bg-indigo-400'][idx % 7]
  }));

  const dayCounts = { 'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0 };
  jobs.forEach(job => {
    if (job.date) {
      const day = new Date(job.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (dayCounts.hasOwnProperty(day)) {
        dayCounts[day]++;
      }
    }
  });
  
  const topDays = Object.entries(dayCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([day, count]) => ({ day, jobs: count }));

  const getDateBounds = () => {
    const now = new Date();
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate),
        isCustom: true
      };
    }
    const days = parseInt(dateRange);
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    return { start, end: now, isCustom: false };
  };

  const getFilteredLeads = () => {
    const { start, end } = getDateBounds();
    return leads.filter(l => {
      const created = new Date(l.createdAt || l.created_at);
      return created >= start && created <= end;
    });
  };

  const getFilteredJobs = () => {
    const { start, end } = getDateBounds();
    return jobs.filter(j => {
      const jobDate = new Date(j.date);
      return jobDate >= start && jobDate <= end;
    });
  };

  const getFilteredInvoices = () => {
    const { start, end } = getDateBounds();
    return invoices.filter(i => {
      const invDate = new Date(i.date || i.created_at);
      return invDate >= start && invDate <= end;
    });
  };

  const generateWeeklyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const { start: rangeStart } = getDateBounds();
    const now = new Date();
    
    return weeks.map((week, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((3 - i + 1) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekLeads = getFilteredLeads().filter(l => {
        const created = new Date(l.createdAt || l.created_at);
        return created >= weekStart && created < weekEnd;
      }).length;

      const weekJobs = getFilteredJobs().filter(j => {
        const jobDate = new Date(j.date);
        return jobDate >= weekStart && jobDate < weekEnd;
      }).length;

      const weekRevenue = getFilteredInvoices().filter(i => {
        const invDate = new Date(i.date || i.created_at);
        return invDate >= weekStart && invDate < weekEnd && i.status === 'paid';
      }).reduce((sum, i) => sum + i.amount, 0);
      
      return {
        week,
        leads: weekLeads,
        jobs: weekJobs,
        revenue: weekRevenue
      };
    });
  };

  const handleExport = useCallback((type) => {
    setIsLoading(true);
    setTimeout(() => {
      const exportFunctions = {
        leads: () => alert('Exporting leads report as CSV...'),
        jobs: () => alert('Exporting jobs report as CSV...'),
        revenue: () => alert('Generating revenue report PDF...')
      };
      exportFunctions[type]?.();
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDateRangeKeyDown = useCallback((e, currentInput) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const inputs = ['start', 'end'];
      const currentIndex = inputs.indexOf(currentInput);
      const nextIndex = e.key === 'ArrowLeft' 
        ? (currentIndex - 1 + inputs.length) % inputs.length
        : (currentIndex + 1) % inputs.length;
      setFocusedDateInput(inputs[nextIndex]);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        const activeElement = document.activeElement;
        const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
        if (!isInputFocused) {
          e.preventDefault();
          document.getElementById('export-section')?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (focusedDateInput) {
      const inputMap = {
        start: document.getElementById('custom-start-date'),
        end: document.getElementById('custom-end-date')
      };
      inputMap[focusedDateInput]?.focus();
    }
  }, [focusedDateInput]);

  const weeklyData = generateWeeklyData();
  const hasData = leads.length > 0 || jobs.length > 0 || invoices.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Business performance insights
            </p>
          </div>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No Data Available"
          description="Start adding leads, jobs, and invoices to see your business analytics and reports."
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Reports and Analytics">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Business performance insights
          </p>
        </div>
        <div 
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          role="group"
          aria-label="Date range selector"
        >
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 pr-10 rounded-xl appearance-none cursor-pointer transition-all ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/10 text-white hover:bg-white/15' 
                  : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
              } border outline-none focus:ring-2 focus:ring-cyan-400/50`}
              aria-label="Select date range"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="custom">Custom Range</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
          </div>
          {dateRange === 'custom' && (
            <div 
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10"
              role="group"
              aria-label="Custom date range inputs"
            >
              <div className="relative">
                <input
                  id="custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onKeyDown={(e) => handleDateRangeKeyDown(e, 'start')}
                  onFocus={() => setFocusedDateInput('start')}
                  onBlur={() => setFocusedDateInput(null)}
                  className={`px-3 py-2 pl-9 rounded-lg text-sm transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/10 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  } border outline-none focus:ring-2 focus:ring-cyan-400/50`}
                  aria-label="Custom start date"
                />
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              </div>
              <ArrowRight className="w-4 h-4 opacity-50" />
              <div className="relative">
                <input
                  id="custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onKeyDown={(e) => handleDateRangeKeyDown(e, 'end')}
                  onFocus={() => setFocusedDateInput('end')}
                  onBlur={() => setFocusedDateInput(null)}
                  className={`px-3 py-2 pl-9 rounded-lg text-sm transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/10 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  } border outline-none focus:ring-2 focus:ring-cyan-400/50`}
                  aria-label="Custom end date"
                />
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        role="list"
        aria-label="Key performance indicators"
      >
        <Card 
          className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}
          role="listitem"
        >
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
              theme === 'dark' ? 'bg-cyan-400/20' : 'bg-cyan-100'
            }`}>
              <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {getFilteredLeads().length}
            </p>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Leads in Period
            </p>
          </CardContent>
        </Card>
        <Card 
          className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}
          role="listitem"
        >
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
              theme === 'dark' ? 'bg-green-400/20' : 'bg-green-100'
            }`}>
              {conversionRate >= 50 ? (
                <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              ) : (
                <TrendingDown className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              )}
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {conversionRate}%
            </p>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Conversion Rate
            </p>
          </CardContent>
        </Card>
        <Card 
          className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}
          role="listitem"
        >
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
              theme === 'dark' ? 'bg-purple-400/20' : 'bg-purple-100'
            }`}>
              <Briefcase className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {getFilteredJobs().length}
            </p>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Jobs in Period
            </p>
          </CardContent>
        </Card>
        <Card 
          className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}
          role="listitem"
        >
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
              theme === 'dark' ? 'bg-yellow-400/20' : 'bg-yellow-100'
            }`}>
              <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ${getFilteredInvoices().filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)}
            </p>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Revenue in Period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h3 className="font-bold">Weekly Performance</h3>
            </div>
            <div className="space-y-3" role="list" aria-label="Weekly performance data">
              {weeklyData.map((week, idx) => (
                <div key={idx} className="space-y-1" role="listitem">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{week.week}</span>
                    <span className={`flex items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {week.leads}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {week.jobs}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {week.revenue}
                      </span>
                    </span>
                  </div>
                  <div 
                    className={`h-3 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                    role="progressbar"
                    aria-valuenow={(week.revenue / 4000) * 100}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`${week.week} revenue progress`}
                  >
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${(week.revenue / 4000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className="font-bold">Service Breakdown</h3>
            </div>
            {serviceBreakdown.length > 0 ? (
              <div className="space-y-3" role="list" aria-label="Service breakdown">
                {serviceBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3" role="listitem">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="flex-1 text-sm">{item.service}</span>
                    <span className="font-bold text-sm">{item.count}</span>
                    <div 
                      className={`w-16 sm:w-20 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                      role="progressbar"
                      aria-valuenow={item.percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${item.service} percentage`}
                    >
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className={`text-sm w-10 text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                No service data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h3 className="font-bold">Busiest Days</h3>
            </div>
            {topDays.length > 0 ? (
              <div className="space-y-3" role="list" aria-label="Busiest days ranking">
                {topDays.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3" role="listitem">
                    <span 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-400 text-slate-950' :
                        idx === 1 ? 'bg-slate-300 text-slate-950' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
                      }`}
                      aria-label={`Rank ${idx + 1}`}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm">{item.day}</span>
                    <span className="font-bold text-sm">{item.jobs} jobs</span>
                    <div 
                      className={`w-20 sm:w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                      role="progressbar"
                      aria-valuenow={(item.jobs / 28) * 100}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${item.day} job count`}
                    >
                      <div 
                        className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${(item.jobs / 28) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                No job data available for busy day analysis
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h3 className="font-bold">Performance Metrics</h3>
            </div>
            <div className="space-y-4">
              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Avg Jobs per Day</span>
                  <span className="font-bold text-lg">{avgJobsPerDay}</span>
                </div>
                <div 
                  className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                  role="progressbar"
                  aria-valuenow={75}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="h-2 w-3/4 rounded-full bg-cyan-400" />
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Avg Revenue per Job</span>
                  <span className="font-bold text-lg">${avgRevenuePerJob}</span>
                </div>
                <div 
                  className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                  role="progressbar"
                  aria-valuenow={66}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="h-2 w-2/3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-bold text-lg">98%</span>
                </div>
                <div 
                  className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}
                  role="progressbar"
                  aria-valuenow={98}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="h-2 w-[98%] rounded-full bg-yellow-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card 
        id="export-section"
        tabIndex={0}
        className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl focus:ring-2 focus:ring-cyan-400/50 outline-none`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <h3 className="font-bold">Export Reports</h3>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-xs">E</kbd> to export
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => handleExport('leads')}
              className={`group p-4 rounded-xl border transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-white/10 hover:bg-white/5 hover:border-cyan-400/30' 
                  : 'border-slate-200 hover:bg-slate-50 hover:border-cyan-400/50'
              } focus:ring-2 focus:ring-cyan-400/50 focus:outline-none`}
              aria-label="Export leads report as CSV"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                theme === 'dark' ? 'bg-cyan-400/20 group-hover:bg-cyan-400/30' : 'bg-cyan-100 group-hover:bg-cyan-200'
              }`}>
                <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <p className="font-semibold text-left">Leads Report</p>
              <p className={`text-sm text-left flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <FileText className="w-3 h-3" />
                Download as CSV
              </p>
            </button>
            <button 
              onClick={() => handleExport('jobs')}
              className={`group p-4 rounded-xl border transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-white/10 hover:bg-white/5 hover:border-purple-400/30' 
                  : 'border-slate-200 hover:bg-slate-50 hover:border-purple-400/50'
              } focus:ring-2 focus:ring-purple-400/50 focus:outline-none`}
              aria-label="Export jobs report as CSV"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                theme === 'dark' ? 'bg-purple-400/20 group-hover:bg-purple-400/30' : 'bg-purple-100 group-hover:bg-purple-200'
              }`}>
                <Briefcase className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <p className="font-semibold text-left">Jobs Report</p>
              <p className={`text-sm text-left flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <FileText className="w-3 h-3" />
                Download as CSV
              </p>
            </button>
            <button 
              onClick={() => handleExport('revenue')}
              className={`group p-4 rounded-xl border transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-white/10 hover:bg-white/5 hover:border-yellow-400/30' 
                  : 'border-slate-200 hover:bg-slate-50 hover:border-yellow-400/50'
              } focus:ring-2 focus:ring-yellow-400/50 focus:outline-none`}
              aria-label="Generate revenue report PDF"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                theme === 'dark' ? 'bg-yellow-400/20 group-hover:bg-yellow-400/30' : 'bg-yellow-100 group-hover:bg-yellow-200'
              }`}>
                <DollarSign className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <p className="font-semibold text-left">Revenue Report</p>
              <p className={`text-sm text-left flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <FileText className="w-3 h-3" />
                Download as PDF
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;