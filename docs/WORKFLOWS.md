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

## 9. Recurring Client Management

### Overview
Manage subscription/recurring cleaning clients.

### Step-by-Step Procedure

**Step 1: Access Customers Tab**
1. Click "Customers" tab
2. View recurring client list

**Step 2: Add Recurring Client**
1. Click "Add Recurring Client"
2. Fill in:
   - Name
   - Phone
   - Email
   - Plan type
   - Frequency (Weekly/Bi-weekly/Monthly)
   - Price
   - Next scheduled date

**Step 3: Manage Existing Client**
- **Pause**: Toggle status to paused
- **Update**: Edit plan or price
- **Cancel**: Remove client

**Step 4: Convert to Job**
When recurring date arrives:
1. Create job from client details
2. Assign crew
3. Mark job as recurring

---

## 10. Daily Operations Checklist

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
