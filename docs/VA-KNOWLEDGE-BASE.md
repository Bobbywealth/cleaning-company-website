# Virtual Assistant Knowledge Base
## 360 Cleaning Co. Website System - Training Manual

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Accessing the System](#2-accessing-the-system)
3. [Dashboard Navigation](#3-dashboard-navigation)
4. [Customer Lead Management](#4-customer-lead-management)
5. [Job Scheduling](#5-job-scheduling)
6. [Crew Management](#6-crew-management)
7. [Invoicing & Payments](#7-invoicing--payments)
8. [Pricing Reference](#8-pricing-reference)
9. [Marketing Center](#9-marketing-center)
10. [Recurring Clients](#10-recurring-clients)
11. [Reports & Analytics](#11-reports--analytics)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. System Overview

### What is this System?
360 Cleaning Co. is a full-service cleaning company operating in New Jersey. This system is a web-based platform that handles:
- Customer quote requests and bookings
- Lead management (potential customers)
- Job scheduling and tracking
- Crew/employee management
- Invoicing and payment processing
- Business reporting

### Technology Stack
| Component | Technology |
|-----------|------------|
| Frontend | React, TailwindCSS, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Real-time | Socket.IO (Live Chat) |
| Payments | Stripe |
| Email | Nodemailer |

### Key URLs
| Page | URL | Purpose |
|------|-----|---------|
| Website Home | `/` | Marketing homepage |
| Quote Form | `/quote` | Customer quote request |
| Online Booking | `/book` | Full booking with payment |
| Admin Login | `/admin` | Staff login |
| Admin Dashboard | `/admin/dashboard` | Main management interface |

---

## 2. Accessing the System

### Admin Login
1. Navigate to `/admin`
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `360cleaning2026`
3. Click Login

### Session Behavior
- Sessions last 24 hours
- If backend is unavailable, system uses localStorage fallback
- Clear browser localStorage if login issues occur

---

## 3. Dashboard Navigation

### Dashboard Tabs
The admin dashboard has 8 main sections accessible via sidebar or tab buttons:

| Tab | Purpose | Badge Info |
|-----|---------|------------|
| Overview | Stats summary, recent activity | - |
| Leads | Customer inquiries & quotes | Shows "New" count |
| Jobs | Scheduled cleaning jobs | Shows active count |
| Crew | Staff management | - |
| Invoices | Billing & payments | - |
| Reports | Analytics & exports | - |
| Marketing | Marketing tools | - |
| Customers | Recurring clients | - |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1-9` | Jump to tab |
| `N` | Go to Leads |
| `J` | Go to Jobs |
| `?` | Show shortcuts overlay |
| `/` | Focus search |
| `Esc` | Close dialogs |

### Header Features
- **Search**: Global search across leads and jobs
- **Notifications**: Bell icon shows new lead count
- **Theme Toggle**: Sun/moon icon switches dark/light mode
- **Auto-refresh**: "Live" indicator shows data refresh status
- **Logout**: Exit admin session

---

## 4. Customer Lead Management

### What is a Lead?
A lead is a customer who submitted a quote request through the website or was added manually.

### Lead Status Flow
```
New → Contacted → Converted
```

### Lead Sources
| Source | Meaning |
|--------|---------|
| Website | Submitted quote form online |
| Cold Call | Manually added from phone inquiry |
| Referral | Word of mouth |

### Processing New Leads

1. **Review the Lead**
   - Name, phone, email for contact
   - Service type requested
   - Property details
   - Estimated quote range
   - Any notes or special requests

2. **Contact the Lead**
   - Call: Click phone number to dial
   - SMS: Click to send text message
   - Email: Click to compose email

3. **Update Lead Status**
   - Click "Contacted" button → status changes to Contacted
   - Click "Convert" button → status changes to Converted
   - If no response, add notes and try again later

### Lead Data Fields
| Field | Description |
|-------|-------------|
| Name | Customer's full name |
| Phone | Contact phone number |
| Email | Contact email |
| Service | Type of cleaning requested |
| Status | New, Contacted, Converted |
| Lead Source | How they found us |
| Business Type | For commercial: Restaurant, Office, etc. |
| Property Size | Sq ft range or bedroom count |
| Bathrooms | Number of bathrooms |
| Frequency | One-time, Weekly, Bi-weekly, Monthly |
| County | Essex, Union, Hudson, Bergen |
| Add-ons | Extra services selected |
| Estimated Quote | Price range from calculator |
| Notes | Special instructions or comments |
| Address | Service location |

### Adding Leads Manually
1. Go to Leads tab
2. Click "Add Lead" button
3. Fill in 3-step form:
   - Step 1: Contact info (name, phone, email)
   - Step 2: Service details (type, property info)
   - Step 3: Additional info (address, notes)
4. Click "Add Lead"

### Bulk Import Leads
1. Go to Leads tab
2. Click "Import" button
3. Upload CSV with format:
   ```
   Name,Phone,Email,BusinessType,Address,Notes
   ```
4. System imports all valid rows

### Editing Leads
1. Click edit icon on lead card
2. Modify fields in popup form
3. Click "Save Changes"

### Deleting Leads
1. Click trash icon on lead card
2. Or select multiple leads and bulk delete

---

## 5. Job Scheduling

### What is a Job?
A job is a confirmed cleaning appointment scheduled for a specific date.

### Job Status Pipeline
```
Pending → Confirmed → Scheduled → Completed
```

### Creating Jobs
**From Leads:**
1. Open lead detail
2. Click "Create Job" or convert lead directly

**Manually:**
1. Go to Jobs tab
2. Click "Add Job"
3. Fill in: Client, Service, Date, Phone, Email
4. Click "Create Job"

### Job Views

#### Kanban Board (Default)
- 4 columns: Pending, Confirmed, Scheduled, Completed
- Drag-and-drop cards between columns
- Quick-add form at bottom of each column
- Click card to expand details

#### Calendar View
- Monthly calendar grid
- Colored dots indicate job status
- Click date to see day's jobs
- Navigate months with arrows

### Job Data Fields
| Field | Description |
|-------|-------------|
| Client | Customer name |
| Service | Type of cleaning |
| Date | Scheduled date |
| Phone | Contact phone |
| Email | Contact email |
| Status | Pending/Confirmed/Scheduled/Completed |
| Notes | Special instructions |

### Updating Job Status
- **Kanban**: Drag card to new column
- **Card Actions**: Click card → click status button to advance
- **Job Flow**: Pending → Confirmed → Scheduled → Completed

### Filtering Jobs
- Filter by status
- Filter by date range
- Use search to find specific jobs

---

## 6. Crew Management

### Crew Member Status
| Status | Meaning | Color |
|--------|---------|-------|
| Available | Ready for new jobs | Green |
| Busy | Currently on a job | Amber |
| Off | Not working today | Grey |

### Adding Crew Members
1. Go to Crew tab
2. Click "Add Team Member"
3. Fill in: Name, Role, Phone, Email
4. Click "Add Member"

### Managing Crew
- **Toggle Status**: Click status badge to cycle through available/busy/off
- **Call/SMS**: Quick action buttons to contact
- **Edit**: Update details in popup
- **Delete**: Remove team member

### Crew Data Fields
| Field | Description |
|-------|-------------|
| Name | Staff full name |
| Role | Lead Cleaner, Cleaner, Supervisor |
| Phone | Contact number |
| Email | Email address |
| Status | Available, Busy, Off |
| Jobs Today | Count of assigned jobs |

---

## 7. Invoicing & Payments

### Invoice Statuses
| Status | Meaning | Color |
|--------|---------|-------|
| Pending | Awaiting payment | Amber |
| Paid | Payment received | Green |
| Overdue | Past due date | Red |

### Creating Invoices
1. Go to Invoices tab
2. Click "Create Invoice"
3. Fill in:
   - Client Name
   - Email
   - Amount ($)
   - Service Description
4. Click "Create Invoice"

### Invoice Actions
| Action | Description |
|--------|-------------|
| Send Email | Send invoice to client via email |
| Mark Paid | Manually mark as paid |
| Pay | Process card payment via Stripe |
| Delete | Remove invoice |

### Stripe Payments
- If Stripe is configured, "Pay" button opens payment modal
- Enter card details to process payment
- Status automatically updates to "Paid" on success
- Without Stripe, use "Mark Paid" button manually

### Sending Invoice Email
1. Click send icon on invoice row
2. System sends HTML email with invoice details
3. Email includes company branding and payment info

### Invoice Data Fields
| Field | Description |
|-------|-------------|
| Invoice ID | Auto-generated (INV-001, etc.) |
| Client | Customer name |
| Email | Billing email |
| Amount | Total cost |
| Status | Pending/Paid/Overdue |
| Date | Invoice date |
| Due Date | Payment deadline |

### Revenue Tracking
- **Revenue card**: Total paid invoices
- **Pending card**: Outstanding amounts
- **Overdue card**: Past due amounts
- **Total Invoices**: All invoices count

---

## 8. Pricing Reference

### Base Prices by Property Size

#### Residential
| Size | Base Price |
|------|------------|
| Studio/1 Bedroom | $120 |
| 2 Bedrooms | $180 |
| 3 Bedrooms | $260 |
| 4+ Bedrooms | $380 |
| Large Home | $500 |

#### Commercial
| Size | Base Price |
|------|------------|
| Small Office (<2,000 sqft) | $180 |
| Medium Office (2,000-5,000 sqft) | $450 |
| Large Office (5,000+ sqft) | $850 |

### Service Type Multipliers
| Service | Multiplier | Example (3BR) |
|---------|------------|---------------|
| Residential | 1.0x | $260 |
| Commercial | 1.15x | $299 |
| Deep Cleaning | 1.6x | $416 |
| Move In/Out | 1.8x | $468 |
| Post-Construction | 2.2x | $572 |

### Bathroom Adjustments
| Bathrooms | Additional |
|-----------|------------|
| 1 | $0 |
| 1.5 | +$20 |
| 2 | +$40 |
| 2.5 | +$60 |
| 3 | +$90 |
| 4+ | +$140 |

### Frequency Discounts
| Frequency | Discount | Example (3BR) |
|-----------|----------|---------------|
| One-time | 0% | $260 |
| Weekly | 15% off | $221 |
| Bi-weekly | 10% off | $234 |
| Monthly | 5% off | $247 |

### Add-on Prices
| Add-on | Price |
|--------|-------|
| Inside Fridge | $40 |
| Inside Oven | $50 |
| Pet Hair | $40 |
| Heavy Dirt/Buildup | $100 |
| Interior Windows | $100 |
| Laundry | $35 |
| Cabinet Interior | $60 |

### County Location Adjustments
| County | Adjustment |
|--------|------------|
| Essex County | +$10 |
| Union County | +$0 |
| Hudson County | +$25 |
| Bergen County | +$20 |

### City/Area Surcharges
| City | Surcharge |
|------|-----------|
| Hoboken | +$35 |
| Jersey City | +$35 |
| Newark | +$15 |
| Montclair | +$20 |
| Bergen County Luxury | +$50 |

### Estimate Calculation Formula
```
Subtotal = (Base Price × Service Multiplier) + Bathroom Adjustment + Add-ons + Location Adjustment
Discount = Subtotal × Frequency Discount Rate
Final Price = Subtotal - Discount
Price Range = Final Price × 0.90 to Final Price × 1.15
```

---

## 9. Marketing Center

### Email Marketing
Access via: Dashboard → Marketing tab → Email Marketing

#### Pre-built Email Templates
| Template | Use Case |
|---------|----------|
| Welcome | New leads after submission |
| Follow-up | Leads who haven't responded |
| Reminder | Remind leads of pending quotes |
| Review | Request review after job completion |

#### Email Variables
Use these placeholders in templates for personalization:
- `{{name}}` - Customer's first name
- `{{company}}` - Company name (360 Cleaning Co.)

#### Sending Bulk Emails
1. Go to Marketing tab
2. Select "Email Marketing"
3. Choose or create template
4. Select recipients (All, New, Contacted, Converted)
5. Click "Send Campaign"

#### API Configuration
Configure email service in Marketing → API Settings:
- SendGrid or Mailgun supported
- Requires API Key
- Requires Verified Sender Email

### SMS Marketing
Access via: Dashboard → Marketing tab → SMS Marketing

#### Pre-built SMS Templates
| Template | Use Case |
|---------|----------|
| Welcome | Initial welcome message |
| Follow-up | Check on pending quotes |
| Reminder | Day before appointment |
| Review | Request review after service |
| Promo | Promotional campaigns |

#### SMS Character Limit
- Maximum 160 characters per message
- Counter shows remaining characters
- Messages over 160 characters may be split

#### Broadcast Messaging
- Send single message to all recipients
- Compose custom message or use template
- Select recipient group (All, New, Contacted, Converted)
- Click "Send SMS" to broadcast

#### Twilio Configuration
Configure in Marketing → API Settings tab:
| Setting | Description |
|---------|-------------|
| Account SID | Twilio Account Identifier |
| Auth Token | Twilio Authentication Token |
| Phone Number | Twilio phone number (with country code, e.g. +1...) |

Save settings with "Save Twilio Settings" button. Test connection before sending campaigns.

### Marketing Analytics
Access via: Dashboard → Marketing tab → Analytics

#### Available Metrics
- Total Leads
- Converted Customers
- Total Jobs
- Conversion Rate Percentage

#### Visualizations
- Lead Status Breakdown (New/Contacted/Converted)
- Job Status Breakdown (Pending/Confirmed/Scheduled/Completed)

### Automation Features
Marketing automation is manual trigger from the UI:
- Email/SMS campaigns require VA to initiate sending
- No automatic scheduled sends configured
- Broadcast messages sent immediately on click

---

## 10. Recurring Clients

### Overview
Recurring clients are subscription customers with scheduled, repeat cleaning services.

### Access
Dashboard → Customers tab

### Plan Types
| Plan | Description | Typical Price |
|------|------------|---------------|
| Basic | Entry-level recurring service | $150-200/mo |
| Standard | Mid-tier recurring maintenance | $250-300/mo |
| Premium | Full-service weekly recurring | $500-700/mo |

### Frequency Options
| Frequency | Interval | Jobs per Month |
|-----------|----------|----------------|
| Weekly | Every week | 4 |
| Bi-weekly | Every 2 weeks | 2 |
| Monthly | Every month | 1 |

### Automation Features
Recurring client automation is manual trigger from the UI:
- No automatic scheduled job creation configured
- VA must click "Schedule" button to create next job
- System does not auto-generate recurring jobs
- Pausing/resuming is manual action

### Adding Recurring Clients
1. Go to Customers tab
2. Click "Add Recurring Client"
3. Fill in:
   - Client Name
   - Phone
   - Email
   - Plan (Basic/Standard/Premium)
   - Frequency (Weekly/Bi-weekly/Monthly)
   - Price ($)

### Managing Recurring Clients

#### Pause/Resume
- Click "Pause" to suspend service
- Click "Resume" to reactivate
- Paused clients don't count toward monthly revenue

#### Schedule Job
- Click "Schedule" button
- Creates job using client's next scheduled date
- Job marked as recurring

#### Edit Client
- Click edit icon to modify details
- Update plan, frequency, price, contact info

#### Delete Client
- Click delete icon to remove
- Confirm deletion in popup

### Monthly Revenue Calculation
System calculates based on active clients:
- Weekly: price × 4
- Bi-weekly: price × 2
- Monthly: price × 1

---

## 11. Reports & Analytics

### Dashboard Stats (Overview Tab)
| Metric | Description |
|--------|-------------|
| New Leads | Leads with "New" status |
| Booked Jobs | Jobs scheduled/confirmed |
| Conversion | Leads converted to jobs (%) |
| Total Jobs | All jobs in system |

### Reports Tab Features

#### Date Range Filtering
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Last year
- Custom date range

#### Key Metrics
| Metric | Description |
|--------|-------------|
| Leads in Period | New leads within date range |
| Conversion Rate | % of leads that became jobs |
| Jobs in Period | Jobs created within date range |
| Revenue in Period | Total paid invoice amount |

#### Weekly Performance
- Shows last 4 weeks data
- Tracks leads, jobs, revenue per week

#### Service Breakdown
- Pie chart of service types requested
- Count and percentage per service

#### Busiest Days
- Ranks days by job count
- Helps optimize scheduling

#### Performance Metrics
- Avg Jobs per Day
- Avg Revenue per Job
- Customer Satisfaction (manual entry)

### Export Reports
| Export | Data Included |
|--------|--------------|
| Leads Report | Name, Phone, Email, Service, Status, Source, Created, Notes |
| Jobs Report | Client, Service, Date, Status, Address, Crew, Price |
| Revenue Report | Invoice ID, Client, Email, Amount, Status, Date |

---

## 12. Troubleshooting

### Login Issues
**Problem**: Cannot log in with correct credentials
**Solution**:
1. Clear browser localStorage
2. Try again with credentials

### Backend Unavailable
**Problem**: "Backend unavailable" warnings
**Solution**: System automatically falls back to localStorage. Data persists but won't sync across devices.

### Stripe Not Configured
**Problem**: Payment buttons show "Stripe Not Configured"
**Solution**: No action needed. Use "Mark Paid" button manually when payments received.

### Email Not Sending
**Problem**: Invoice emails not arriving
**Solution**: Check SMTP configuration. System logs emails when SMTP not configured.

### SMS Not Sending
**Problem**: SMS campaign shows error
**Solution**: Configure Twilio settings in Marketing → API Settings tab. Requires Account SID, Auth Token, and Phone Number.

### Marketing Campaign Not Working
**Problem**: Send button doesn't process
**Solution**: Verify API credentials are saved in Settings tab. Bulk email requires SendGrid/Mailgun. Bulk SMS requires Twilio.

### Data Not Saving
**Problem**: Changes not persisting
**Solution**:
1. Check if backend is running
2. Clear localStorage and retry
3. Refresh page

### Common Questions

**Q: How do I convert a lead to a job?**
A: Open the lead → Click "Convert" button → Job is created

**Q: How do I schedule a job?**
A: Create job with date → Drag to "Scheduled" column when crew assigned

**Q: How do I process a payment?**
A: Click "Pay" on invoice (if Stripe configured) or click "Mark Paid"

**Q: How do I add a recurring client?**
A: Go to Customers tab → Add recurring client with plan details

**Q: How do I export data?**
A: Go to Reports tab → Click export button for leads/jobs/revenue

---

## Quick Reference Card

### Status Flows
- **Lead Status**: New → Contacted → Converted
- **Job Status**: Pending → Confirmed → Scheduled → Completed
- **Invoice Status**: Pending → Paid (or Overdue)
- **Crew Status**: Available (green) / Busy (amber) / Off (grey)

### Most Common Actions
1. Check Leads tab for new inquiries
2. Contact leads via phone/email
3. Update lead status as contacted/converted
4. Create jobs for confirmed leads
5. Assign crew to scheduled jobs
6. Create invoices on job completion
7. Export weekly reports

### Contact Info
- Company Phone: (862) 285-4949
- Admin Default: admin / 360cleaning2026
- Service Area: Essex, Union, Hudson, Bergen Counties NJ
