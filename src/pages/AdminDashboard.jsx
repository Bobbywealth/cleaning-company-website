import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Star,
  RefreshCw,
  HardHat,
  CreditCard,
  BarChart3,
  Megaphone,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  Minus,
  Keyboard,
  Filter,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';

const LeadsList = lazy(() => import('@/components/LeadsList'));
const JobsManager = lazy(() => import('@/components/JobsManager'));
const CustomerProfile = lazy(() => import('@/components/CustomerProfile'));
const MarketingCenter = lazy(() => import('@/components/MarketingCenter'));
const CrewManagement = lazy(() => import('@/components/CrewManagement'));
const Invoices = lazy(() => import('@/components/Invoices'));
const RecurringClients = lazy(() => import('@/components/RecurringClients'));
const Reports = lazy(() => import('@/components/Reports'));

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

const Toast = memo(({ toast, theme, onDismiss }) => {
  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const bgColors = {
    success: theme === 'dark' ? 'bg-green-500/90' : 'bg-green-500',
    error: theme === 'dark' ? 'bg-red-500/90' : 'bg-red-500',
    info: theme === 'dark' ? 'bg-cyan-500/90' : 'bg-cyan-500'
  };

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 left-1/2 z-[100] ${bgColors[toast?.type || 'success']} text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-medium animate-slide-down`}
      style={{ transform: 'translateX(-50%)' }}
    >
      {icons[toast?.type || 'success']}
      <span>{toast?.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 hover:bg-white/20 rounded-full p-1 transition"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { theme } = useApp();

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    window.showToast = addToast;
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed top-4 left-1/2 z-[100] flex flex-col gap-2" style={{ transform: 'translateX(-50%)' }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            theme={theme}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

const SkeletonLoader = memo(({ theme }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
      {[1, 2, 3, 4].map(i => (
        <SkeletonCard key={i} theme={theme} className="h-28" />
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <SkeletonCard theme={theme} className="h-64" />
      <SkeletonCard theme={theme} className="h-64" />
    </div>
  </div>
));

const StatCard = memo(({ icon: Icon, label, value, trend, trendValue, color, theme }) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  };

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card
      className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-200`}
      role="figure"
      aria-label={`${label}: ${value}`}
    >
      <CardContent className="p-4 md:p-6 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs md:text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-black mt-1 truncate">{value}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${trendColors[trend]}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendValue}</span>
          </div>
        </div>
        <div
          className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </CardContent>
    </Card>
  );
});

const Sidebar = memo(({
  tabs,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  theme,
  isMobile,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setIsMobileOpen]);

  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-slate-950/95 border-r border-white/10' : 'bg-white border-r border-slate-200'} backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src="https://iili.io/Btud5oF.th.png"
              alt="Cleaning Company Logo"
              className="h-10 w-10 rounded-xl object-cover border border-white/10"
            />
            <div>
              <p className="font-bold text-sm leading-none">Admin</p>
              <p className="text-xs text-cyan-400">360 Cleaning Co.</p>
            </div>
          </div>
        )}
        <button
          onClick={() => isMobile ? setIsMobileOpen(false) : setCollapsed(!collapsed)}
          className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2" role="tablist" aria-label="Dashboard sections">
        <div className="space-y-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isMobile) setIsMobileOpen(false);
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label}${tab.badge ? `, ${tab.badge} notifications` : ''}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                activeTab === tab.id
                  ? 'bg-cyan-400 text-slate-950 font-semibold'
                  : theme === 'dark'
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && tab.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {tab.label}
                  {tab.badge && ` (${tab.badge})`}
                </span>
              )}
              {!collapsed && (
                <span className="hidden group-hover:inline-block absolute left-full ml-2 px-2 py-1 rounded bg-slate-900 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity md:hidden">
                  {tab.label}
                </span>
              )}
              
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${theme === 'dark' ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'} ${collapsed ? 'justify-center' : ''}`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      {sidebarContent}
    </>
  );
});

const KeyboardShortcutsOverlay = memo(({ onClose, theme }) => (
  <div
    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Keyboard shortcuts"
  >
    <div
      onClick={e => e.stopPropagation()}
      className={`w-full max-w-lg rounded-3xl ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'} overflow-hidden`}
    >
      <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between`}>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Keyboard Shortcuts
        </h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Navigation</h3>
          <div className="space-y-2">
            <ShortcutRow keys={['1-9']} description="Go to tab" theme={theme} />
            <ShortcutRow keys={['N']} description="New Lead" theme={theme} />
            <ShortcutRow keys={['J']} description="Jobs" theme={theme} />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">General</h3>
          <div className="space-y-2">
            <ShortcutRow keys={['?']} description="Show shortcuts" theme={theme} />
            <ShortcutRow keys={['/']} description="Focus search" theme={theme} />
            <ShortcutRow keys={['Esc']} description="Close dialog" theme={theme} />
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ShortcutRow = memo(({ keys, description, theme }) => (
  <div className="flex items-center justify-between">
    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</span>
    <div className="flex gap-1">
      {keys.map(key => (
        <kbd
          key={key}
          className={`px-2 py-1 rounded-lg text-xs font-mono ${
            theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
          }`}
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
));

const SearchOverlay = memo(({ searchQuery, setSearchQuery, results, onSelect, onClose, theme }) => (
  <div
    className="fixed inset-0 z-[70] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-label="Search results"
  >
    <div
      onClick={e => e.stopPropagation()}
      className={`w-full max-w-2xl rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'} overflow-hidden shadow-2xl`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads, jobs, customers..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
          className={`flex-1 bg-transparent outline-none text-base ${theme === 'dark' ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'}`}
          aria-label="Global search"
        />
        <kbd className={`hidden md:inline px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
          ESC
        </kbd>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No results found</p>
          </div>
        ) : (
          <div className="py-2">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  onSelect(result);
                  onClose();
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition text-left`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  result.type === 'lead' ? 'bg-cyan-400/20 text-cyan-400' :
                  result.type === 'job' ? 'bg-blue-400/20 text-blue-400' :
                  result.type === 'customer' ? 'bg-green-400/20 text-green-400' :
                  'bg-purple-400/20 text-purple-400'
                }`}>
                  {result.type === 'lead' && <Users className="w-5 h-5" />}
                  {result.type === 'job' && <Calendar className="w-5 h-5" />}
                  {result.type === 'customer' && <Star className="w-5 h-5" />}
                  {result.type === 'crew' && <HardHat className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  <p className={`text-xs truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {result.subtitle}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
                }`}>
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
));

const FloatingActionButton = memo(({ onClick, theme }) => (
  <button
    onClick={onClick}
    className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 md:hidden ${
      theme === 'dark' ? 'bg-cyan-400 text-slate-950' : 'bg-cyan-500 text-white'
    }`}
    aria-label="Quick actions"
  >
    <Plus className="w-6 h-6" />
  </button>
));

const QuickActionsMenu = memo(({ isOpen, onClose, onAction, theme }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { icon: Users, label: 'New Lead', action: () => onAction('leads') },
    { icon: Calendar, label: 'New Job', action: () => onAction('jobs') },
    { icon: HardHat, label: 'Add Crew', action: () => onAction('crew') },
    { icon: CreditCard, label: 'New Invoice', action: () => onAction('invoices') },
  ];

  return (
    <div
      ref={menuRef}
      className={`fixed bottom-20 right-6 z-50 w-48 rounded-2xl overflow-hidden shadow-2xl ${
        theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
      }`}
      role="menu"
      aria-label="Quick actions"
    >
      <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        Quick Actions
      </div>
      {actions.map((item, index) => (
        <button
          key={item.label}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition ${
            theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'
          }`}
          role="menuitem"
        >
          <item.icon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
});

const AdminDashboard = memo(() => {
  const navigate = useNavigate();
  const { user, stats, logout, leads, jobs, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const searchInputRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    localStorage.getItem('dashboardTheme');
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users, badge: stats.newLeads > 0 ? stats.newLeads : null },
    { id: 'jobs', label: 'Jobs', icon: Calendar, badge: jobs.length > 0 ? jobs.length : null },
    { id: 'crew', label: 'Crew', icon: HardHat },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'customers', label: 'Customers', icon: Star },
  ], [stats.newLeads, jobs.length]);

  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];

    leads.forEach(lead => {
      if (
        lead.name.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.service?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'lead',
          id: lead.id,
          title: lead.name,
          subtitle: `${lead.phone || 'No phone'} • ${lead.service || 'No service'}`,
          data: lead
        });
      }
    });

    jobs.forEach(job => {
      if (
        job.client?.toLowerCase().includes(query) ||
        job.service?.toLowerCase().includes(query) ||
        job.address?.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'job',
          id: job.id,
          title: job.client,
          subtitle: `${job.service || 'No service'} • ${job.status}`,
          data: job
        });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, leads, jobs]);

  const handleSearchSelect = useCallback((result) => {
    if (result.type === 'lead') {
      setSelectedCustomer(result.data);
    } else if (result.type === 'job') {
      setActiveTab('jobs');
    }
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case '?':
          e.preventDefault();
          setShowShortcuts(true);
          break;
        case '/':
          e.preventDefault();
          setShowSearch(true);
          break;
        case 'n':
          e.preventDefault();
          setActiveTab('leads');
          break;
        case 'j':
          e.preventDefault();
          setActiveTab('jobs');
          break;
        case 'escape':
          setShowShortcuts(false);
          setShowSearch(false);
          setShowNotifications(false);
          setShowFabMenu(false);
          break;
        case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
          const index = parseInt(e.key) - 1;
          if (index < tabs.length) {
            e.preventDefault();
            setActiveTab(tabs[index].id);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tabs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.bookedJobs / stats.totalLeads) * 100)
    : 0;

  const recentLeads = useMemo(() =>
    [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [leads]
  );

  const upcomingJobs = useMemo(() =>
    jobs.slice(0, 5),
    [jobs]
  );

  const fabActions = useCallback((action) => {
    setActiveTab(action);
  }, []);

  return (
    <ToastProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
        <div className={`fixed inset-0 pointer-events-none opacity-40 ${theme === 'dark' ? '' : 'opacity-10'}`}>
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
        </div>

        <Sidebar
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          theme={theme}
          isMobile={isMobile}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className={`transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          <header
            className={`relative z-10 border-b ${theme === 'dark' ? 'border-white/10 bg-slate-950/75' : 'border-slate-200 bg-white'} backdrop-blur-xl sticky top-0`}
          >
            <div className="max-w-7xl mx-auto px-4 md:px-5 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setIsMobileOpen(true)}
                      className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition`}
                      aria-label="Open menu"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  )}
                  
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => setShowSearch(true)}
                    className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition`}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Search...</span>
                    <kbd className={`ml-4 px-1.5 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>/</kbd>
                  </button>

                  <button
                    onClick={() => setShowShortcuts(true)}
                    className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition hidden md:flex`}
                    aria-label="Keyboard shortcuts"
                    title="Press ? for shortcuts"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      autoRefresh
                        ? 'bg-green-400/20 text-green-400'
                        : theme === 'dark'
                          ? 'bg-white/10 text-slate-400'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-pressed={autoRefresh}
                    aria-label={`Auto-refresh is ${autoRefresh ? 'enabled' : 'disabled'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                    {autoRefresh ? 'Live' : 'Paused'}
                  </button>

                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition`}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`relative p-2 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition`}
                      aria-label="Notifications"
                      aria-expanded={showNotifications}
                    >
                      <Bell className="w-4 h-4" />
                      {stats.newLeads > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {stats.newLeads > 99 ? '99+' : stats.newLeads}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div
                        className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 ${
                          theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'
                        }`}
                        role="region"
                        aria-label="Notifications panel"
                      >
                        <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between`}>
                          <h3 className="font-bold">Notifications</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition`}
                            aria-label="Close notifications"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                          {leads.filter(l => l.status === 'New').length === 0 ? (
                            <div className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No new notifications</p>
                            </div>
                          ) : (
                            <>
                              <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-cyan-400/10' : 'bg-cyan-50'}`}>
                                <p className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                                  <Bell className="w-4 h-4" />
                                  {leads.filter(l => l.status === 'New').length} New Lead{leads.filter(l => l.status === 'New').length !== 1 ? 's' : ''}
                                </p>
                                {leads.filter(l => l.status === 'New').slice(0, 3).map(lead => (
                                  <button
                                    key={lead.id}
                                    onClick={() => {
                                      setSelectedCustomer(lead);
                                      setActiveTab('leads');
                                      setShowNotifications(false);
                                    }}
                                    className={`w-full text-left mt-2 p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white'} transition`}
                                  >
                                    <p className="font-medium text-sm">{lead.name}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.phone}</p>
                                  </button>
                                ))}
                              </div>
                              <div className="px-4 py-3">
                                <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Recent Activity</p>
                                {leads.slice(0, 5).map(lead => (
                                  <button
                                    key={lead.id}
                                    onClick={() => {
                                      setSelectedCustomer(lead);
                                      setActiveTab('leads');
                                      setShowNotifications(false);
                                    }}
                                    className={`w-full text-left py-2 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-50'} rounded-lg transition`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{lead.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        lead.status === 'New' ? 'bg-blue-400/20 text-blue-400' :
                                        lead.status === 'Contacted' ? 'bg-yellow-400/20 text-yellow-400' :
                                        'bg-green-400/20 text-green-400'
                                      }`}>
                                        {lead.status}
                                      </span>
                                    </div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.service}</p>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-sm text-slate-300 hidden lg:inline">
                    {user?.username}
                  </span>
                  <Button
                    onClick={handleLogout}
                    className={`bg-red-400/20 text-red-300 hover:bg-red-400/30 rounded-xl text-sm hidden sm:flex items-center gap-2`}
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-8">
            {isMobile && (
              <div className="mb-4">
                <button
                  onClick={() => setShowSearch(true)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}`}
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className={`flex-1 text-left text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Search leads, jobs...
                  </span>
                  <kbd className={`px-2 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>/</kbd>
                </button>
              </div>
            )}

            <div className="hidden md:flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${
                    activeTab === tab.id
                      ? 'bg-cyan-400 text-slate-950'
                      : theme === 'dark'
                        ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-slate-950/20'
                        : 'bg-red-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  
                </button>
              ))}
            </div>

            <Suspense fallback={<SkeletonLoader theme={theme} />}>
              {activeTab === 'overview' && (
                <div
                  id="panel-overview"
                  role="tabpanel"
                  aria-labelledby="tab-overview"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6">
                    <StatCard
                      icon={Users}
                      label="New Leads"
                      value={stats.newLeads}
                      trend="up"
                      trendValue="12% this week"
                      color="bg-cyan-400/20 text-cyan-400"
                      theme={theme}
                    />
                    <StatCard
                      icon={Calendar}
                      label="Booked Jobs"
                      value={stats.bookedJobs}
                      trend="up"
                      trendValue="8% this week"
                      color="bg-blue-400/20 text-blue-400"
                      theme={theme}
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Conversion"
                      value={`${conversionRate}%`}
                      trend={conversionRate >= 50 ? 'up' : conversionRate >= 30 ? 'neutral' : 'down'}
                      trendValue={conversionRate >= 50 ? 'Great rate!' : conversionRate >= 30 ? 'Average' : 'Needs work'}
                      color="bg-green-400/20 text-green-400"
                      theme={theme}
                    />
                    <StatCard
                      icon={Check}
                      label="Total Jobs"
                      value={stats.totalJobs}
                      trend="up"
                      trendValue="5% this month"
                      color="bg-purple-400/20 text-purple-400"
                      theme={theme}
                    />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-bold">Recent Leads</h2>
                          <button
                            onClick={() => setActiveTab('leads')}
                            className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                          >
                            View All <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {recentLeads.length === 0 ? (
                            <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              No leads yet
                            </p>
                          ) : (
                            recentLeads.map(lead => (
                              <div
                                key={lead.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} transition hover:scale-[1.02]`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-cyan-400/20 flex items-center justify-center font-bold">
                                    {lead.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{lead.name}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.phone}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  lead.status === 'New' ? 'bg-cyan-400/20 text-cyan-400' :
                                  lead.status === 'Contacted' ? 'bg-yellow-400/20 text-yellow-400' :
                                  'bg-green-400/20 text-green-400'
                                }`}>
                                  {lead.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-bold">Upcoming Jobs</h2>
                          <button
                            onClick={() => setActiveTab('jobs')}
                            className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                          >
                            View All <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          {upcomingJobs.length === 0 ? (
                            <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              No jobs scheduled
                            </p>
                          ) : (
                            upcomingJobs.map(job => (
                              <div
                                key={job.id}
                                className={`flex items-center justify-between p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} transition hover:scale-[1.02]`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-blue-400/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">{job.client}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{job.service}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === 'Pending' ? 'bg-yellow-400/20 text-yellow-400' :
                                  job.status === 'Confirmed' ? 'bg-green-400/20 text-green-400' :
                                  job.status === 'Scheduled' ? 'bg-blue-400/20 text-blue-400' :
                                  'bg-purple-400/20 text-purple-400'
                                }`}>
                                  {job.status}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <h2 className="text-lg font-bold mb-4">Quick Access</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        {[
                          { icon: Users, label: 'Leads', tab: 'leads', color: 'from-cyan-400/20 to-cyan-600/20' },
                          { icon: Calendar, label: 'Jobs', tab: 'jobs', color: 'from-blue-400/20 to-blue-600/20' },
                          { icon: HardHat, label: 'Crew', tab: 'crew', color: 'from-purple-400/20 to-purple-600/20' },
                          { icon: CreditCard, label: 'Invoices', tab: 'invoices', color: 'from-green-400/20 to-green-600/20' },
                          { icon: BarChart3, label: 'Reports', tab: 'reports', color: 'from-yellow-400/20 to-yellow-600/20' },
                          { icon: RefreshCw, label: 'Recurring', tab: 'jobs', color: 'from-red-400/20 to-red-600/20' },
                          { icon: Megaphone, label: 'Marketing', tab: 'marketing', color: 'from-pink-400/20 to-pink-600/20' },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={() => setActiveTab(item.tab)}
                            className={`flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${item.color} border border-white/10 p-4 hover:scale-105 transition group`}
                          >
                            <item.icon className="w-6 h-6 group-hover:scale-110 transition" />
                            <span className="text-xs font-medium text-center">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'leads' && (
                <div id="panel-leads" role="tabpanel" aria-labelledby="tab-leads">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <LeadsList
                        searchQuery={searchQuery}
                        onCustomerClick={(lead) => setSelectedCustomer(lead)}
                        theme={theme}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div id="panel-jobs" role="tabpanel" aria-labelledby="tab-jobs">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <JobsManager theme={theme} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'crew' && (
                <div id="panel-crew" role="tabpanel" aria-labelledby="tab-crew">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <CrewManagement theme={theme} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div id="panel-invoices" role="tabpanel" aria-labelledby="tab-invoices">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <Invoices theme={theme} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'reports' && (
                <div id="panel-reports" role="tabpanel" aria-labelledby="tab-reports">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <Reports theme={theme} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'marketing' && (
                <div id="panel-marketing" role="tabpanel" aria-labelledby="tab-marketing">
                  <MarketingCenter theme={theme} />
                </div>
              )}

              {activeTab === 'customers' && (
                <div id="panel-customers" role="tabpanel" aria-labelledby="tab-customers">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <h2 className="text-xl font-bold mb-4">All Customers</h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.filter(l => l.status === 'Converted').map(lead => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedCustomer(lead)}
                            className={`p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-12 w-12 rounded-full bg-green-400/20 flex items-center justify-center text-xl font-bold">
                                {lead.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold">{lead.name}</p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{lead.phone}</p>
                              </div>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{lead.service}</p>
                          </div>
                        ))}
                      </div>
                      {leads.filter(l => l.status === 'Converted').length === 0 && (
                        <p className={`text-center py-12 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          No customers yet. Convert leads to see them here.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'settings' && (
                <div id="panel-settings" role="tabpanel" aria-labelledby="tab-settings">
                  <Card className={`${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200'} rounded-2xl md:rounded-3xl`}>
                    <CardContent className="p-4 md:p-6">
                      <h2 className="text-xl font-bold mb-4">Settings</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                          <div>
                            <p className="font-semibold">Theme</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              Current: {theme === 'dark' ? 'Dark' : 'Light'}
                            </p>
                          </div>
                          <button
                            onClick={toggleTheme}
                            className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} transition`}
                          >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                          <div>
                            <p className="font-semibold">Auto-refresh</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              Refresh data every 30 seconds
                            </p>
                          </div>
                          <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-4 py-2 rounded-xl font-medium transition ${
                              autoRefresh ? 'bg-green-400/20 text-green-400' : 'bg-slate-400/20 text-slate-400'
                            }`}
                          >
                            {autoRefresh ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </Suspense>
          </main>

          <footer className={`relative z-10 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} py-4 px-4 md:px-5`}>
            <div className={`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
              <p className="flex items-center gap-2">
                <span className="hidden sm:inline">Press</span>
                <kbd className={`px-1.5 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>?</kbd>
                <span className="hidden sm:inline">for keyboard shortcuts</span>
                <span className="sm:hidden"><HelpCircle className="w-3 h-3 inline" /></span>
                <span className="mx-2">•</span>
                <span>© 2026 360 Cleaning Co. Admin</span>
              </p>
            </div>
          </footer>
        </div>

        {showShortcuts && (
          <KeyboardShortcutsOverlay onClose={() => setShowShortcuts(false)} theme={theme} />
        )}

        {showSearch && (
          <SearchOverlay
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            results={globalSearchResults}
            onSelect={handleSearchSelect}
            onClose={() => setShowSearch(false)}
            theme={theme}
          />
        )}

        <FloatingActionButton onClick={() => setShowFabMenu(!showFabMenu)} theme={theme} />
        <QuickActionsMenu
          key={showFabMenu}
          isOpen={showFabMenu}
          onClose={() => setShowFabMenu(false)}
          onAction={fabActions}
          theme={theme}
        />

        {selectedCustomer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Customer profile"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
            >
              <CustomerProfile
                customer={selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                theme={theme}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        *:focus-visible {
          outline: 2px solid rgb(34 211 238);
          outline-offset: 2px;
        }
      `}</style>
    </ToastProvider>
  );
});

export default AdminDashboard;