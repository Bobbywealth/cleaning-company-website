# Operational Workflows
## Step-by-Step Procedures for Virtual Assistants

---

## 1. Processing New Leads

### Overview
Leads come from website quote forms, phone inquiries, or referrals. Process them within 2 hours for best conversion.

### Step-by-Step Procedure

**Step 1: Access Leads Tab**
1. Log into admin dashboard at `/admin`
2. Click "Leads" tab or press `N`
3. You see list sorted by newest first

**Step 2: Identify New Leads**
1. Look for leads with "New" badge (orange)
2. Check notification bell for count
3. Filter by "New" status if needed

**Step 3: Review Lead Details**
Click on lead card to see:
- Contact info (name, phone, email)
- Service type requested
- Property details (size, bathrooms)
- Location (county, city)
- Any add-ons selected
- Estimated quote range
- Notes from customer

**Step 4: Contact the Lead**
Use quick action buttons:
- **Phone**: Click phone icon to dial
- **SMS**: Click message icon to text
- **Email**: Click email icon to compose

**Step 5: Document Conversation**
1. Add notes about the call
2. Note if interested, not interested, or needs time
3. Set follow-up date if needed

**Step 6: Update Lead Status**
- **If contacted**: Click "Contacted" button
- **If ready to book**: Click "Convert" button
- **If not ready**: Leave as New and add notes

---

## 2. Converting Lead to Job

### Overview
When a lead is ready to book, convert them to a job for scheduling.

### Step-by-Step Procedure

**Step 1: Open Lead Detail**
1. Go to Leads tab
2. Find the converted lead
3. Click on lead card to expand

**Step 2: Create Job**
1. Click "Convert to Job" button
2. Or manually create job with same details

**Step 3: Fill Job Details**
- **Client**: Pre-filled from lead name
- **Phone**: Pre-filled from lead
- **Email**: Pre-filled from lead
- **Service**: Pre-filled from lead
- **Date**: Enter scheduled date
- **Notes**: Add any special instructions

**Step 4: Assign Crew (Optional)**
1. Go to Crew tab
2. Find available crew member
3. Note crew assignment in job

**Step 5: Set Initial Status**
- Job starts in "Pending" status
- Move through pipeline as confirmed

---

## 3. Scheduling Jobs

### Overview
Jobs move through a Kanban pipeline: Pending → Confirmed → Scheduled → Completed

### Step-by-Step Procedure

**Step 1: View Jobs**
1. Click "Jobs" tab or press `J`
2. Default view is Kanban board
3. Switch to Calendar for date view

**Step 2: Review Pending Jobs**
1. Look at "Pending" column
2. These need customer confirmation
3. Contact customer to confirm

**Step 3: Confirm Job**
1. Drag job card to "Confirmed" column
2. Or click job → click "Confirm" button
3. Contact customer to finalize date

**Step 4: Schedule Job**
1. Drag to "Scheduled" column
2. Assign crew member
3. Set date and time

**Step 5: Complete Job**
1. When cleaning done, drag to "Completed"
2. Or click job → click "Complete"
3. Create invoice for the job

---

## 4. Creating Invoices

### Overview
After job completion, create an invoice to bill the customer.

### Step-by-Step Procedure

**Step 1: Access Invoices**
1. Click "Invoices" tab
2. Click "Create Invoice" button

**Step 2: Enter Invoice Details**
- **Client Name**: Customer name
- **Email**: Billing email address
- **Amount**: Total cost
- **Service**: Description of work

**Step 3: Submit Invoice**
1. Click "Create Invoice"
2. Invoice appears in list
3. Note the invoice ID (INV-XXX)

**Step 4: Send to Customer**
1. Click send icon on invoice row
2. Email is sent with invoice
3. If email not configured, note to send manually

**Step 5: Track Payment**
- **If paid**: Click "Mark Paid" button
- **If Stripe enabled**: Click "Pay" for card
- Status changes to green "Paid"

---

## 5. Managing Crew

### Overview
Keep crew status updated so you know who can take new jobs.

### Step-by-Step Procedure

**Step 1: Access Crew Tab**
1. Click "Crew" tab
2. See all staff members
3. View status at a glance (green/amber/grey)

**Step 2: Add New Crew Member**
1. Click "Add Team Member"
2. Fill in:
   - Full Name
   - Role (Lead Cleaner, Cleaner, Supervisor)
   - Phone number
   - Email address
3. Click "Add Member"

**Step 3: Update Crew Status**
Click status toggle to cycle:
- Available (green) → Busy (amber) → Off (grey)

**Step 4: Contact Crew Member**
Quick action buttons:
- **Call**: Click phone icon
- **SMS**: Click message icon
- **Edit**: Update details

**Step 5: Remove Crew Member**
1. Click crew card to open
2. Click delete/trash icon
3. Confirm deletion

---

## 6. Exporting Reports

### Overview
Generate reports for leads, jobs, and revenue to track business performance.

### Step-by-Step Procedure

**Step 1: Access Reports Tab**
1. Click "Reports" tab
2. See analytics dashboard

**Step 2: Select Date Range**
1. Choose preset (7, 30, 90, 365 days)
2. Or select "Custom Range"
3. Pick start and end dates

**Step 3: Review Metrics**
- **Leads in Period**: New leads count
- **Conversion Rate**: % leads to jobs
- **Jobs in Period**: Jobs created
- **Revenue**: Total paid amounts

**Step 4: Export Data**
Click export button for desired report:
- **Leads Report**: CSV of all leads
- **Jobs Report**: CSV of all jobs
- **Revenue Report**: CSV of invoices

**Step 5: Save/Share Report**
1. File downloads automatically
2. Open in Excel/Sheets
3. Share with team as needed

---

## 7. Bulk Import Leads

### Overview
Import multiple leads from a CSV file, useful for cold call lists.

### CSV Format Required
```csv
Name,Phone,Email,BusinessType,Address,Notes
John Smith,(555)123-4567,john@email.com,Restaurant,123 Main St,Met at expo
Jane Doe,(555)987-6543,jane@email.com,Office,456 Oak Ave,Referral from Bob
```

### Step-by-Step Procedure

**Step 1: Prepare CSV**
1. Create spreadsheet with columns:
   - Name
   - Phone
   - Email
   - BusinessType
   - Address
   - Notes
2. Save as .csv file
3. First row must be headers

**Step 2: Access Import**
1. Go to Leads tab
2. Click "Import" button
3. Import modal opens

**Step 3: Upload File**
1. Click "Choose CSV File"
2. Select your prepared file
3. System validates format

**Step 4: Confirm Import**
1. Review number of leads found
2. Click to confirm
3. Leads added to system

---

## 8. Handling Customer Complaints

### Overview
If a customer reports an issue with a completed job.

### Step-by-Step Procedure

**Step 1: Document Complaint**
1. Note customer name and contact
2. Record job date and details
3. Write down specific issue

**Step 2: Review Job Record**
1. Find job in Jobs tab
2. Check crew assigned
3. Note any special circumstances

**Step 3: Contact Customer**
1. Call to apologize
2. Ask for details
3. Offer resolution (re-clean, discount, etc.)

**Step 4: Take Action**
- **If re-clean needed**: Schedule redo job
- **If discount needed**: Create partial invoice
- **If refund needed**: Process via Stripe or manual

**Step 5: Document Resolution**
1. Add notes to job record
2. Note action taken
3. Update if customer satisfied

---

## 9. Email Marketing Campaign

### Prerequisites
Email service (SendGrid/Mailgun) must be configured in Marketing → API Settings tab.

### Step-by-Step Procedure

**Step 1: Access Marketing Center**
1. Click "Marketing" tab
2. Ensure "Email Marketing" is selected

**Step 2: Select Template**
1. Browse available templates:
   - Welcome: New lead submission
   - Follow-up: No response after 2-3 days
   - Reminder: Remind of pending quote
   - Review: Request review after job completion
2. Click template to select
3. Template body populates in composer

**Step 3: Customize Message**
1. Edit subject line
2. Customize body text
3. Use variables for personalization:
   - `{{name}}` - Customer's first name
   - `{{company}}` - Company name
4. Preview if needed

**Step 4: Choose Recipients**
1. Select from dropdown:
   - All Leads
   - New Leads
   - Contacted Leads
   - Converted Customers

**Step 5: Send Campaign**
1. Click "Send Campaign"
2. Confirm recipient count
3. Wait for success confirmation

### Available Templates
| Template | Best Used For |
|---------|---------------|
| Welcome | New lead submission |
| Follow-up | No response after 2-3 days |
| Reminder | Remind of pending quote |
| Review | After job completion |

### Automation Notes
- Email campaigns are manually triggered (not scheduled)
- No automatic email sends configured
- VA initiates all email broadcasts

---

## 10. SMS Marketing Campaign

### Prerequisites
Twilio account must be configured in API Settings tab.

### Step-by-Step Procedure

**Step 1: Configure Twilio**
1. Click "API Settings" tab
2. Enter Account SID (starts with AC...)
3. Enter Auth Token
4. Enter Twilio Phone Number (with country code, e.g. +1234567890)
5. Click "Save Twilio Settings"

**Step 2: Access SMS Marketing**
1. Click "Marketing" tab
2. Select "SMS Marketing"

**Step 3: Select or Create Template**
1. Browse SMS templates:
   - Welcome: Initial welcome message
   - Follow-up: Pending quotes follow-up
   - Reminder: Day before appointment
   - Review: Request review after service
   - Promo: Promotional campaigns
2. Click to select
3. Or write custom (max 160 characters)

**Step 4: Choose Recipients**
1. Select audience:
   - All Leads
   - New Leads
   - Contacted Leads
   - Converted Customers

**Step 5: Send Campaign**
1. Click "Send SMS Campaign"
2. Confirm recipient count
3. Wait for confirmation

### Available Templates
| Template | Best Used For |
|---------|---------------|
| Welcome | Initial welcome message |
| Follow-up | Pending quotes |
| Reminder | Day before appointment |
| Review | After service |
| Promo | Promotional campaigns |

### Broadcast Messaging
1. Click "Broadcast" option
2. Compose single message
3. Select recipient group
4. Click "Send SMS" to broadcast to all

### Automation Notes
- SMS campaigns are manually triggered (not scheduled)
- No automatic SMS sends configured
- VA initiates all SMS broadcasts
- Messages over 160 characters may be split by carrier

---

## 11. Managing Recurring Clients

### Step-by-Step Procedure

**Step 1: Access Customers Tab**
1. Click "Customers" tab
2. View recurring client list

**Step 2: Add Recurring Client**
1. Click "Add Recurring Client"
2. Fill in form:
   - Name (required)
   - Phone (required)
   - Email (required)
   - Plan: Basic, Standard, or Premium
   - Frequency: Weekly, Bi-weekly, or Monthly
   - Price (required)
3. Click "Add Recurring Client"

**Step 3: Schedule Next Job**
1. Find client card
2. Click "Schedule" button
3. Job created with:
   - Client name
   - Service (plan name)
   - Next scheduled date
   - Client contact info

**Step 4: Pause/Resume Service**
1. Click "Pause" on active client
2. Client status changes to paused
3. Click "Resume" to reactivate

**Step 5: Update Client Details**
1. Click edit icon on client card
2. Modify any field
3. Click "Save Changes"

### Plan Options
| Plan | Description |
|------|-------------|
| Basic | Entry-level recurring service |
| Standard | Mid-tier recurring maintenance |
| Premium | Full-service weekly recurring |

### Frequency Options
| Frequency | Jobs per Month |
|-----------|----------------|
| Weekly | 4 |
| Bi-weekly | 2 |
| Monthly | 1 |

### Automation Notes
- Recurring jobs are NOT automatically scheduled
- VA must manually click "Schedule" for each job
- No cron/scheduler configured - all automation is manual trigger

---

## 12. Daily Operations Checklist

### Morning (Start of Day)
- [ ] Log into admin dashboard
- [ ] Check notification bell for new leads
- [ ] Review today's scheduled jobs
- [ ] Confirm crew availability

### Mid-Morning
- [ ] Begin processing new leads
- [ ] Contact overnight submissions
- [ ] Update lead statuses

### Midday
- [ ] Follow up on pending leads
- [ ] Check job status progress
- [ ] Handle any urgent issues

### Afternoon
- [ ] Process completed jobs
- [ ] Create pending invoices
- [ ] Send invoice emails

### End of Day
- [ ] Confirm next day's schedule
- [ ] Export daily reports if needed
- [ ] Plan follow-ups for tomorrow
- [ ] Log out of admin
