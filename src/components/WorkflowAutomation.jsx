import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useApp } from '@/context/AppContext';
import {
  Workflow,
  Play,
  Pause,
  Plus,
  X,
  Check,
  Clock,
  Zap,
  AlertCircle,
  Settings,
  Trash2,
  Edit,
  ChevronRight,
  Activity,
  Bell,
  RefreshCw,
  Calendar,
  Users,
  CreditCard,
  Send,
  MapPin
} from 'lucide-react';

const WORKFLOW_TYPES = [
  { id: 'create_recurring_jobs', name: 'Recurring Job Generator', icon: Calendar, description: 'Auto-generate jobs for recurring clients when due', color: 'bg-blue-400/20 text-blue-400' },
  { id: 'check_overdue_invoices', name: 'Overdue Invoice Alert', icon: CreditCard, description: 'Mark invoices overdue and send reminders', color: 'bg-red-400/20 text-red-400' },
  { id: 'check_stale_leads', name: 'Lead Stale Check', icon: AlertCircle, description: 'Alert when leads go cold', color: 'bg-yellow-400/20 text-yellow-400' },
  { id: 'send_lead_followup', name: 'Lead Follow-up', icon: Send, description: 'Send automated follow-up messages', color: 'bg-green-400/20 text-green-400' },
];

const WorkflowAutomation = ({ theme = 'dark' }) => {
  const { user } = useApp();
  const [workflows, setWorkflows] = useState([]);
  const [smsSequences, setSmsSequences] = useState([]);
  const [crewZones, setCrewZones] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workflows');
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [runningWorkflow, setRunningWorkflow] = useState(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'schedule',
    action_type: '',
    trigger_config: {},
    action_config: {},
    is_active: true
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('360cleaning_auth');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const tokenData = JSON.parse(token);
      const headers = { 'Authorization': `Bearer ${tokenData.token}` };

      const [wfRes, smsRes, zonesRes, notifRes, auditRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/workflows`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/sms-sequences`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/crew-zones`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/notifications?limit=20`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/audit-log?limit=20`, { headers })
      ]);

      if (wfRes.ok) setWorkflows(await wfRes.json());
      if (smsRes.ok) setSmsSequences(await smsRes.json());
      if (zonesRes.ok) setCrewZones(await zonesRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (auditRes.ok) setAuditLog(await auditRes.json());
    } catch (error) {
      console.error('Failed to fetch automation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runWorkflow = async (workflowId) => {
    setRunningWorkflow(workflowId);
    const token = localStorage.getItem('360cleaning_auth');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${JSON.parse(token).token}` }
      });
      const result = await res.json();
      if (result.success) {
        alert(`Workflow executed! Actions: ${result.results.actions?.length || 0}`);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
    } finally {
      setRunningWorkflow(null);
      fetchData();
    }
  };

  const runAllWorkflows = async () => {
    setRunningWorkflow('all');
    const token = localStorage.getItem('360cleaning_auth');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/workflows/run-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${JSON.parse(token).token}` }
      });
      const result = await res.json();
      if (result.success) {
        const successCount = result.results.filter(r => r.success).length;
        alert(`Ran ${successCount}/${result.results.length} workflows successfully`);
      }
    } catch (error) {
      console.error('Failed to run workflows:', error);
    } finally {
      setRunningWorkflow(null);
      fetchData();
    }
  };

  const toggleWorkflow = async (workflow) => {
    const token = localStorage.getItem('360cleaning_auth');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JSON.parse(token).token}` },
        body: JSON.stringify({ is_active: !workflow.is_active })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!confirm('Delete this workflow?')) return;
    const token = localStorage.getItem('360cleaning_auth');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${JSON.parse(token).token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const getWorkflowIcon = (actionType) => {
    const type = WORKFLOW_TYPES.find(t => t.id === actionType);
    return type ? type.icon : Workflow;
  };

  const getWorkflowColor = (actionType) => {
    const type = WORKFLOW_TYPES.find(t => t.id === actionType);
    return type ? type.color : 'bg-slate-400/20 text-slate-400';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_created': return Calendar;
      case 'invoice_overdue': return CreditCard;
      case 'stale_lead': return AlertCircle;
      case 'lead_followup': return Send;
      default: return Bell;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonCard className="h-10 w-64" />
          <SkeletonCard className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Automation Center
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure automated workflows and monitor activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllWorkflows}
            disabled={runningWorkflow !== null}
            className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl"
          >
            {runningWorkflow === 'all' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run All Now
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'workflows', label: 'Workflows', icon: Workflow },
          { key: 'sms', label: 'SMS Sequences', icon: Send },
          { key: 'zones', label: 'Crew Zones', icon: MapPin },
          { key: 'notifications', label: 'Notifications', icon: Bell },
          { key: 'audit', label: 'Audit Log', icon: Activity },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-cyan-400 text-slate-950'
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map(workflow => {
            const Icon = getWorkflowIcon(workflow.action_type);
            return (
              <Card key={workflow.id} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl ${getWorkflowColor(workflow.action_type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleWorkflow(workflow)}
                        className={`p-1.5 rounded-lg ${workflow.is_active ? 'bg-green-400/20 text-green-400' : 'bg-slate-400/20 text-slate-400'}`}
                        title={workflow.is_active ? 'Pause' : 'Activate'}
                      >
                        {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => runWorkflow(workflow.id)}
                        disabled={runningWorkflow === workflow.id}
                        className="p-1.5 rounded-lg bg-blue-400/20 text-blue-400 hover:bg-blue-400/30"
                        title="Run now"
                      >
                        <RefreshCw className={`w-4 h-4 ${runningWorkflow === workflow.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteWorkflow(workflow.id)}
                        className="p-1.5 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold mb-1">{workflow.name}</h3>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {workflow.description}
                  </p>
                  <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock className="w-3 h-3" />
                    Last run: {formatDate(workflow.last_run_at)}
                  </div>
                  <div className={`flex items-center gap-2 text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Activity className="w-3 h-3" />
                    Runs: {workflow.run_count || 0}
                  </div>
                  <div className={`mt-3 px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    workflow.is_active ? 'bg-green-400/20 text-green-400' : 'bg-slate-400/20 text-slate-400'
                  }`}>
                    {workflow.is_active ? 'Active' : 'Paused'}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'sms' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">SMS Follow-up Sequences</h3>
            <div className="space-y-4">
              {smsSequences.map(seq => (
                <div key={seq.id} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        seq.is_active ? 'bg-green-400/20 text-green-400' : 'bg-slate-400/20 text-slate-400'
                      }`}>
                        {seq.trigger_status}
                      </span>
                      <span className="text-sm font-medium">{seq.name}</span>
                    </div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Step {seq.step_order} • {seq.delay_hours}h delay
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {seq.message_template}
                  </p>
                </div>
              ))}
              {smsSequences.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No SMS sequences configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'zones' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Crew Service Zones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crewZones.map(zone => (
                <div key={zone.id} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">{zone.zone_name}</span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Crew: {zone.crew_name || 'Unassigned'}
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    ZIPs: {zone.zip_codes?.join(', ') || 'None assigned'}
                  </p>
                </div>
              ))}
              {crewZones.length === 0 && (
                <p className={`text-center py-8 col-span-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No crew zones configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.map(notif => {
                const Icon = getNotificationIcon(notif.type);
                return (
                  <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}`}>
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notif.type.replace(/_/g, ' ')}</p>
                      <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {notif.message}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notif.delivery_status === 'sent' ? 'bg-green-400/20 text-green-400' :
                      notif.delivery_status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {notif.delivery_status}
                    </span>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No notifications yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">Audit Log</h3>
            <div className="space-y-2">
              {auditLog.map(log => (
                <div key={log.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    log.action_type.includes('CREATE') ? 'bg-green-400/20 text-green-400' :
                    log.action_type.includes('UPDATE') ? 'bg-blue-400/20 text-blue-400' :
                    log.action_type.includes('DELETE') ? 'bg-red-400/20 text-red-400' :
                    log.action_type.includes('RUN') ? 'bg-purple-400/20 text-purple-400' :
                    'bg-slate-400/20 text-slate-400'
                  }`}>
                    {log.action_type}
                  </span>
                  <span className="flex-1 truncate">{log.entity_type}</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {log.performed_by || 'system'}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
              {auditLog.length === 0 && (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No audit log entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowAutomation;