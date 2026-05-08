import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const MarketingCenter = ({ theme = 'dark' }) => {
  const { leads, jobs } = useApp();
  const [activeTab, setActiveTab] = useState('email');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [smsTemplate, setSmsTemplate] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [smsHistory, setSmsHistory] = useState([]);
  const [emailHistory, setEmailHistory] = useState([]);

  // Email templates
  const emailTemplates = [
    {
      name: 'Welcome Email',
      subject: 'Welcome to 360 Cleaning Co.!',
      body: `Hi {{name}},

Thank you for choosing 360 Cleaning Co.! We're excited to help you keep your space sparkling clean.

Your quote request has been received and our team will contact you within 2 hours.

What to expect:
✅ Free, no-obligation quote
✅ Flexible scheduling
✅ Professional, background-checked cleaners
✅ 100% satisfaction guarantee

Need immediate assistance? Call us at (862) 285-4949!

Best regards,
The 360 Cleaning Team 🧹`
    },
    {
      name: 'Follow-up',
      subject: 'Following up on your quote request',
      body: `Hi {{name}},

I wanted to follow up on your cleaning quote request. Have you had a chance to review our proposal?

We're offering:
✅ Competitive pricing
✅ Same-week availability
✅ 100% satisfaction guarantee

Would you like to schedule a call to discuss your cleaning needs? Just reply to this email or call (862) 285-4949.

Best,
360 Cleaning Team`
    },
    {
      name: 'Thank You',
      subject: 'Thank you for your business!',
      body: `Hi {{name}},

Thank you for choosing 360 Cleaning Co.! We hope you love your clean space.

As a reminder:
✅ We offer recurring service discounts
✅ Refer a friend and both get 10% off
✅ We're always here at (862) 285-4949

Leave us a review? It helps other NJ families find us! ⭐

Best,
Your 360 Cleaning Team 🏠`
    }
  ];

  // SMS templates
  const smsTemplates = [
    {
      name: 'Quick Reply',
      message: `Hi {{name}}! This is 360 Cleaning Co. We're excited to help! Your quote is ready. Reply YES to proceed or call (862) 285-4949 🧹`
    },
    {
      name: 'Follow-up',
      message: `Hi {{name}}! Just checking in on your cleaning quote. Questions? We're here! Call/text (862) 285-4949 ✨`
    },
    {
      name: 'Appointment Reminder',
      message: `Reminder: 360 Cleaning Co. is coming {{date}}! Please ensure access. Questions? (862) 285-4949 🧹`
    },
    {
      name: 'Thank You',
      message: `Hi {{name}}! Thanks for choosing 360 Cleaning Co.! We'd love your feedback ⭐ Reply with any comments!`
    },
    {
      name: 'Promo - Referral',
      message: `🎉 {{name}}, refer a friend to 360 Cleaning & BOTH get 10% off! Just mention this text. Call (862) 285-4949 to book!`
    }
  ];

  const selectEmailTemplate = (template) => {
    setEmailTemplate(template.body);
  };

  const selectSmsTemplate = (template) => {
    setSmsTemplate(template.message);
  };

  const sendBulkEmail = () => {
    // In production, this would integrate with SendGrid, Mailgun, etc.
    const recipientCount = selectedRecipients === 'all' 
      ? leads.filter(l => l.status !== 'Converted').length 
      : leads.filter(l => l.status === selectedRecipients).length;
    
    alert(`Email campaign sent to ${recipientCount} recipients!\n\n(In production, this would integrate with SendGrid/Mailgun API)`);
    
    setEmailHistory([...emailHistory, {
      id: Date.now(),
      type: 'email',
      recipients: recipientCount,
      template: 'Custom Template',
      sentAt: new Date().toLocaleString()
    }]);
  };

  const sendBulkSms = () => {
    // In production, this would integrate with Twilio
    const { accountSid, authToken, phoneNumber } = twilioConfig;
    
    if (!accountSid || !authToken || !phoneNumber) {
      alert('Please configure Twilio settings first!');
      return;
    }

    const recipientCount = selectedRecipients === 'all' 
      ? leads.filter(l => l.status !== 'Converted').length 
      : leads.filter(l => l.status === selectedRecipients).length;
    
    alert(`SMS campaign sent to ${recipientCount} recipients via Twilio!\n\nAccount SID: ${accountSid}\nFrom: ${phoneNumber}\n\n(In production, this would use Twilio API)`);
    
    setSmsHistory([...smsHistory, {
      id: Date.now(),
      type: 'sms',
      recipients: recipientCount,
      template: 'Custom Template',
      sentAt: new Date().toLocaleString()
    }]);
  };

  const exportToCsv = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Service', 'Status', 'Date'].join(','),
      ...leads.map(lead => [
        lead.name,
        lead.phone,
        lead.email,
        lead.service,
        lead.status,
        new Date(lead.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `360-cleaning-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertedLeads = leads.filter(l => l.status === 'Converted');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Marketing Center</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Email, SMS & Analytics
          </p>
        </div>
        <Button 
          onClick={exportToCsv}
          className="bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl"
        >
          📊 Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 overflow-x-auto pb-2 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>
        {[
          { key: 'email', label: 'Email Marketing', icon: '✉️' },
          { key: 'sms', label: 'SMS Marketing', icon: '💬' },
          { key: 'analytics', label: 'Analytics', icon: '📊' },
          { key: 'settings', label: 'API Settings', icon: '⚙️' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-cyan-400 text-slate-950'
                : theme === 'dark'
                  ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Email Marketing Tab */}
      {activeTab === 'email' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Templates */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">📝 Email Templates</h3>
              <div className="space-y-3">
                {emailTemplates.map((template, idx) => (
                  <div 
                    key={idx}
                    onClick={() => selectEmailTemplate(template)}
                    className={`p-4 rounded-xl cursor-pointer transition ${
                      theme === 'dark' 
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {template.subject}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compose */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">✉️ Compose Email</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Recipients
                  </label>
                  <select
                    value={selectedRecipients}
                    onChange={(e) => setSelectedRecipients(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  >
                    <option value="all">All Leads ({leads.length})</option>
                    <option value="New">New Leads ({leads.filter(l => l.status === 'New').length})</option>
                    <option value="Contacted">Contacted ({leads.filter(l => l.status === 'Contacted').length})</option>
                    <option value="Converted">Customers ({convertedLeads.length})</option>
                  </select>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Message (use {'{{name}}'} for personalization)
                  </label>
                  <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    rows={10}
                    className={`w-full px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none resize-none`}
                    placeholder="Write your email template..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowPreview(true)}
                    className={`flex-1 rounded-xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    👁️ Preview
                  </Button>
                  <Button 
                    onClick={sendBulkEmail}
                    className="flex-1 bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
                  >
                    📤 Send Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SMS Marketing Tab */}
      {activeTab === 'sms' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Templates */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">📱 SMS Templates</h3>
              <div className="space-y-3">
                {smsTemplates.map((template, idx) => (
                  <div 
                    key={idx}
                    onClick={() => selectSmsTemplate(template)}
                    className={`p-4 rounded-xl cursor-pointer transition ${
                      theme === 'dark' 
                        ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      {template.message.substring(0, 50)}...
                    </p>
                    <p className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {template.message.length}/160 characters
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compose */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-4">
              <h3 className="font-bold mb-4">💬 Compose SMS</h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Recipients
                  </label>
                  <select
                    value={selectedRecipients}
                    onChange={(e) => setSelectedRecipients(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  >
                    <option value="all">All Leads ({leads.length})</option>
                    <option value="New">New Leads ({leads.filter(l => l.status === 'New').length})</option>
                    <option value="Contacted">Contacted ({leads.filter(l => l.status === 'Contacted').length})</option>
                    <option value="Converted">Customers ({convertedLeads.length})</option>
                  </select>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Message (use {'{{name}}'} and {'{{date}}'} for personalization)
                  </label>
                  <textarea
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    rows={4}
                    maxLength={160}
                    className={`w-full px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none resize-none`}
                    placeholder="Write your SMS..."
                  />
                  <p className={`text-xs mt-1 text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {smsTemplate.length}/160
                  </p>
                </div>

                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    ⚠️ Configure Twilio settings in the API tab before sending
                  </p>
                </div>

                <Button 
                  onClick={sendBulkSms}
                  className="w-full bg-green-400 text-slate-950 hover:bg-green-300 rounded-xl py-3"
                >
                  📱 Send SMS Campaign via Twilio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{leads.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Leads</p>
              </CardContent>
            </Card>
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{convertedLeads.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Converted</p>
              </CardContent>
            </Card>
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{jobs.length}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Jobs</p>
              </CardContent>
            </Card>
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-black ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0}%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Conversion Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">📈 Lead & Job Trends</h3>
              <div className={`h-64 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="text-center">
                  <p className={`text-6xl mb-4 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>📊</p>
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                    Chart visualization would go here
                  </p>
                  <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Integrate with Chart.js or Recharts for live data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">📊 Lead Status Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { status: 'New', count: leads.filter(l => l.status === 'New').length, color: 'bg-cyan-400' },
                    { status: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: 'bg-yellow-400' },
                    { status: 'Converted', count: leads.filter(l => l.status === 'Converted').length, color: 'bg-green-400' },
                  ].map(item => (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1">{item.status}</span>
                      <span className="font-bold">{item.count}</span>
                      <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${leads.length > 0 ? (item.count / leads.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
              <CardContent className="p-4">
                <h3 className="font-bold mb-4">📅 Job Status Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { status: 'Pending', count: jobs.filter(j => j.status === 'Pending').length, color: 'bg-yellow-400' },
                    { status: 'Confirmed', count: jobs.filter(j => j.status === 'Confirmed').length, color: 'bg-green-400' },
                    { status: 'Scheduled', count: jobs.filter(j => j.status === 'Scheduled').length, color: 'bg-blue-400' },
                    { status: 'Completed', count: jobs.filter(j => j.status === 'Completed').length, color: 'bg-purple-400' },
                  ].map(item => (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                      <span className="flex-1">{item.status}</span>
                      <span className="font-bold">{item.count}</span>
                      <div className={`w-24 h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${jobs.length > 0 ? (item.count / jobs.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* API Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Twilio */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-red-400/20 flex items-center justify-center text-2xl">📱</div>
                <div>
                  <h3 className="font-bold">Twilio SMS API</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>SMS Marketing Integration</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Account SID
                  </label>
                  <input
                    type="text"
                    value={twilioConfig.accountSid}
                    onChange={(e) => setTwilioConfig({...twilioConfig, accountSid: e.target.value})}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Auth Token
                  </label>
                  <input
                    type="password"
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig({...twilioConfig, authToken: e.target.value})}
                    placeholder="Your Twilio Auth Token"
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Twilio Phone Number
                  </label>
                  <input
                    type="text"
                    value={twilioConfig.phoneNumber}
                    onChange={(e) => setTwilioConfig({...twilioConfig, phoneNumber: e.target.value})}
                    placeholder="+1234567890"
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  />
                </div>
                <Button 
                  onClick={() => alert('Settings saved!\n\nIn production, this would securely store your API keys.')}
                  className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-xl"
                >
                  💾 Save Twilio Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email (SendGrid/Mailgun) */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-400/20 flex items-center justify-center text-2xl">✉️</div>
                <div>
                  <h3 className="font-bold">Email Service</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>SendGrid / Mailgun / SMTP</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Provider
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  >
                    <option>SendGrid (Recommended)</option>
                    <option>Mailgun</option>
                    <option>Amazon SES</option>
                    <option>Custom SMTP</option>
                  </select>
                </div>
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    API Key
                  </label>
                  <input
                    type="password"
                    placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    From Email
                  </label>
                  <input
                    type="email"
                    placeholder="info@360cleaningco.com"
                    className={`w-full px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'} border outline-none`}
                  />
                </div>
                <Button 
                  onClick={() => alert('Email settings saved!\n\nIn production, this would configure SendGrid/Mailgun integration.')}
                  className="w-full bg-blue-400 text-white hover:bg-blue-300 rounded-xl"
                >
                  💾 Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send History */}
      {(smsHistory.length > 0 || emailHistory.length > 0) && (
        <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} rounded-2xl`}>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">📋 Send History</h3>
            <div className="space-y-2">
              {[...smsHistory, ...emailHistory].sort((a, b) => b.id - a.id).slice(0, 10).map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.type === 'sms' ? '📱' : '✉️'}</span>
                    <div>
                      <p className="font-medium text-sm">{item.type === 'sms' ? 'SMS' : 'Email'} Campaign</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.recipients} recipients
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.sentAt}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketingCenter;
