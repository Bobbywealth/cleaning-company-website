# System Architecture Documentation
## 360 Cleaning Co. Website

---

## 1. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| React Router | Navigation |
| Leaflet | Service area map |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web server |
| PostgreSQL | Database |
| Socket.IO | Real-time chat |
| JWT | Authentication |
| Stripe | Payment processing |
| Nodemailer | Email sending |

---

## 2. Database Schema

### Table: leads
Customer quote requests and inquiries.

```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  service VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'New',
  lead_source VARCHAR(50) DEFAULT 'Website',
  business_type VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: jobs
Scheduled cleaning appointments.

```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  client VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  service VARCHAR(100),
  date VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  notes TEXT,
  crew_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: crew_members
Cleaning staff.

```sql
CREATE TABLE crew_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'available',
  jobs_today INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: invoices
Billing records.

```sql
CREATE TABLE invoices (
  id VARCHAR(50) PRIMARY KEY,
  client VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: recurring_clients
Subscription customers.

```sql
CREATE TABLE recurring_clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  plan VARCHAR(50),
  frequency VARCHAR(50),
  price DECIMAL(10, 2),
  next_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: admin_users
Dashboard authentication.

```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| GET | `/api/auth/verify` | Verify JWT token |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/bulk` | Bulk import from CSV |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

### Crew
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crew` | Get all crew members |
| POST | `/api/crew` | Create crew member |
| PUT | `/api/crew/:id` | Update crew member |
| DELETE | `/api/crew/:id` | Delete crew member |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| POST | `/api/invoices/send` | Send invoice email |

### Recurring Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recurring` | Get all recurring clients |
| POST | `/api/recurring` | Create recurring client |
| PUT | `/api/recurring/:id` | Update recurring client |
| DELETE | `/api/recurring/:id` | Delete recurring client |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/config` | Get Stripe publishable key |
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## 4. Data Flow

### Customer Quote Request Flow
```
1. Customer fills form at /quote
2. Frontend submits to POST /api/leads
3. Backend inserts into leads table
4. Response returned to frontend
5. Customer sees thank you page
6. Lead appears in admin dashboard
```

### Admin Login Flow
```
1. Admin submits credentials to /api/auth/login
2. Backend validates against admin_users table
3. JWT token generated (24h expiry)
4. Token stored in localStorage
5. Subsequent requests include Bearer token
6. Backend middleware validates token
```

### Payment Processing Flow
```
1. Invoice created via POST /api/invoices
2. Admin clicks "Pay" button
3. Frontend calls POST /api/payments/create-intent
4. Backend creates Stripe PaymentIntent
5. Frontend uses clientSecret to confirm payment
6. Stripe webhook fires on success
7. Invoice status updated to "paid"
```

---

## 5. localStorage Fallback

When backend is unavailable, the system uses localStorage:

| Key | Data |
|-----|------|
| `360cleaning_leads` | Leads array |
| `360cleaning_jobs` | Jobs array |
| `360cleaning_auth` | Auth session |
| `crewMembers` | Crew members |
| `invoices` | Invoices |
| `recurringClients` | Recurring clients |
| `360cleaning_theme` | Theme preference |
| `dashboardTheme` | Dashboard theme |

---

## 6. Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
PORT=3001
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@360cleaningco.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

---

## 7. Component Architecture

### Pages
- `Home.jsx` - Marketing homepage
- `QuotePage.jsx` - Quote request form
- `ThankYouPage.jsx` - Post-submission confirmation
- `AdminLogin.jsx` - Login page
- `AdminDashboard.jsx` - Main admin interface

### Dashboard Components
- `LeadsList.jsx` - Lead CRM with search/filter
- `JobsManager.jsx` - Kanban + calendar views
- `CrewManagement.jsx` - Staff management
- `Invoices.jsx` - Invoice list and payments
- `Reports.jsx` - Analytics and exports
- `MarketingCenter.jsx` - Marketing tools
- `RecurringClients.jsx` - Subscription management
- `CustomerProfile.jsx` - Customer details

### Public Components
- `BookingForm.jsx` - Multi-step booking
- `OnlineBooking.jsx` - Full booking flow
- `ServiceAreaMap.jsx` - Leaflet map
- `LiveChat.jsx` - Socket.IO chat widget
- `BookingCalendar.jsx` - Date/time picker
- `PaymentForm.jsx` - Stripe payment

---

## 8. Key Utility Functions

### Pricing (`pricingConstants.js`)
- `PROPERTY_BASE_PRICES` - Base price by size
- `SERVICE_MULTIPLIERS` - Service type multipliers
- `BATHROOM_ADJUSTMENTS` - Extra per bathroom
- `FREQUENCY_DISCOUNTS` - Discount rates
- `ADD_ON_PRICES` - Add-on costs
- `COUNTY_ADJUSTMENTS` - Location surcharges

### Estimate Calculator (`calculateCleaningEstimate.js`)
```javascript
calculateCleaningEstimate(formData)
// Returns: lowEstimate, highEstimate, breakdown
```

### Dashboard Utils (`dashboard.js`)
- `getLeadStatusColor()` - Status badge colors
- `getJobStatusColor()` - Job status colors
- `getCrewStatusColor()` - Crew status colors
- `getInvoiceStatusColor()` - Invoice status colors
- `formatDate()` - Date formatting

---

## 9. Third-Party Integrations

### Stripe
- Payment processing for invoices
- Requires publishable key (frontend)
- Requires secret key (backend)
- Webhook for payment confirmations

### Nodemailer
- Sends invoice emails
- SMTP configuration required
- Falls back to console logging

### Socket.IO
- Real-time live chat
- Broadcasts messages between clients
- Used on homepage for customer support

---

## 10. Deployment

### Backend (Render)
- Web Service
- Start command: `cd server && npm start`
- Environment: Node.js 18+

### Frontend (Static)
- Vite build
- Output in `dist/` folder
- Connects to backend via `VITE_API_URL`

### Database
- PostgreSQL (Render or external)
- SSL required for production
