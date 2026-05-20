# Quick Reference Guide
## 360 Cleaning Co. - Virtual Assistant Essentials

---

## Access Credentials

| System | Credentials |
|--------|-------------|
| Admin Dashboard | Username: `admin` / Password: `360cleaning2026` |
| Login URL | `/admin` |
| Dashboard URL | `/admin/dashboard` |

---

## Status Workflows

### Lead Status Flow
```
NEW → CONTACTED → CONVERTED
```
- **NEW**: Just submitted quote request
- **CONTACTED**: You have reached out
- **CONVERTED**: Became a paying customer/job

### Job Status Flow
```
PENDING → CONFIRMED → SCHEDULED → COMPLETED
```
- **PENDING**: Created, awaiting confirmation
- **CONFIRMED**: Customer agreed, needs scheduling
- **SCHEDULED**: Date/crew assigned
- **COMPLETED**: Service delivered

### Invoice Status
```
PENDING → PAID (or OVERDUE)
```

### Crew Status
```
AVAILABLE (green) | BUSY (amber) | OFF (grey)
```

---

## Pricing At-A-Glance

### Base Prices
| Property | Price |
|----------|-------|
| Studio/1BR | $120 |
| 2 Bedroom | $180 |
| 3 Bedroom | $260 |
| 4+ Bedroom | $380 |
| Large Home | $500 |

### Service Multipliers
| Service | Multiplier |
|---------|------------|
| Residential | 1.0x |
| Commercial | 1.15x |
| Deep Cleaning | 1.6x |
| Move In/Out | 1.8x |
| Post-Construction | 2.2x |

### Frequency Discounts
| Frequency | Discount |
|-----------|---------|
| Weekly | 15% off |
| Bi-weekly | 10% off |
| Monthly | 5% off |

### Key Add-ons
| Add-on | Price |
|--------|-------|
| Inside Fridge | $40 |
| Inside Oven | $50 |
| Pet Hair | $40 |
| Heavy Dirt | $100 |

### County Surcharges
| County | Adjustment |
|--------|------------|
| Essex | +$10 |
| Union | +$0 |
| Hudson | +$25 |
| Bergen | +$20 |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-9` | Jump to tab number |
| `N` | Go to Leads tab |
| `J` | Go to Jobs tab |
| `?` | Show shortcuts help |
| `/` | Focus global search |
| `Esc` | Close dialog/overlay |

---

## Daily Task Checklist

### Morning Routine
- [ ] Check Leads tab for new submissions
- [ ] Review notification count (bell icon)
- [ ] Sort leads by New status

### Lead Processing
- [ ] Call new leads within 2 hours
- [ ] Update status to Contacted after call
- [ ] Add notes about conversation
- [ ] If interested, create Job
- [ ] If not ready, schedule follow-up

### Job Management
- [ ] Check upcoming jobs for today
- [ ] Assign crew to scheduled jobs
- [ ] Update status as jobs complete

### End of Day
- [ ] Create invoices for completed jobs
- [ ] Export daily reports if needed
- [ ] Note any follow-ups for tomorrow

---

## Common Procedures

### Contact a Lead
1. Go to Leads tab
2. Find lead (search or scroll)
3. Click phone/email to contact
4. Update status after contact

### Create Job from Lead
1. Open lead details
2. Click "Convert" or "Create Job"
3. Fill in date and crew
4. Job created in Pending status

### Send Invoice
1. Go to Invoices tab
2. Click "Create Invoice"
3. Enter client details
4. Click send icon to email

### Mark Payment Received
1. Find invoice in list
2. Click "Mark Paid" button
3. Status updates to green

---

## Important Notes

- **Service Area**: Essex, Union, Hudson, Bergen Counties NJ
- **Phone**: (862) 285-4949
- **Business Hours**: Mon-Sun 7AM - 8PM
- **Default Admin**: admin / 360cleaning2026

### System Notes
- Backend unavailable = uses localStorage (data still works)
- Stripe not configured = use "Mark Paid" manually
- Email not configured = emails logged only, not sent

---

## Marketing Templates

### Email Templates
- Welcome Email
- Follow-up
- Thank You

### SMS Templates
- Quick Reply
- Follow-up
- Appointment Reminder
- Thank You
- Promo - Referral

### Sending Bulk
1. Marketing tab → Email/SMS
2. Select template or write custom
3. Choose recipients
4. Send Campaign

---

## Recurring Clients

### Plans
- Basic: $150-200/mo
- Standard: $250-300/mo
- Premium: $500-700/mo

### Frequency
- Weekly (4x/month)
- Bi-weekly (2x/month)
- Monthly (1x/month)

### Actions
- Pause/Resume service
- Schedule next job
- Edit details

---

## URL Reference

| Page | Route |
|------|-------|
| Homepage | `/` |
| Quote Form | `/quote` |
| Booking | `/book` |
| Thank You | `/thank-you` |
| Admin Login | `/admin` |
| Dashboard | `/admin/dashboard` |

---

## Dashboard Tabs

| Tab | What You'll Find |
|-----|------------------|
| Overview | Stats, recent leads, upcoming jobs |
| Leads | All customer inquiries |
| Jobs | Scheduled cleanings |
| Crew | Staff list and status |
| Invoices | Bills and payments |
| Reports | Analytics and exports |
| Marketing | Email, SMS campaigns |
| Customers | Recurring clients |
