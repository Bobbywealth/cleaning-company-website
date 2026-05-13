# 360 Cleaning Company - Backend Setup Guide

## Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Local Development (External Database)
DATABASE_URL=postgresql://db_360cleaning_db_user:wsfABRacn3jqoqmXb8jVdBcw10QlbXsv@dpg-d829cvl7vvec73b3v1h0-a.oregon-postgres.render.com/db_360cleaning_db

JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### 3. Start the Backend Server

```bash
cd server
npm start
```

You should see:
```
🚀 Initializing database...
✓ Leads table ready
✓ Jobs table ready
✓ Crew members table ready
✓ Invoices table ready
✓ Recurring clients table ready
✓ Admin users table ready
✓ Default admin user created
✅ Database initialized successfully!
✅ Server running on port 3001
📡 API available at http://localhost:3001/api
🔗 Health check: http://localhost:3001/api/health
```

### 4. Configure Frontend

Create a `.env` file in the root directory for the frontend:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Start the Frontend

```bash
npm run dev
```

## Default Admin Credentials

- **Username:** admin
- **Password:** 360cleaning2026

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/verify` - Verify JWT token (requires auth)

### Leads
- `GET /api/leads` - Get all leads (requires auth)
- `POST /api/leads` - Create new lead (public)
- `PUT /api/leads/:id` - Update lead (requires auth)
- `DELETE /api/leads/:id` - Delete lead (requires auth)

### Jobs
- `GET /api/jobs` - Get all jobs (requires auth)
- `POST /api/jobs` - Create new job (requires auth)
- `PUT /api/jobs/:id` - Update job (requires auth)
- `DELETE /api/jobs/:id` - Delete job (requires auth)

### Crew
- `GET /api/crew` - Get all crew members (requires auth)
- `POST /api/crew` - Create crew member (requires auth)
- `PUT /api/crew/:id` - Update crew member (requires auth)
- `DELETE /api/crew/:id` - Delete crew member (requires auth)

### Invoices
- `GET /api/invoices` - Get all invoices (requires auth)
- `POST /api/invoices` - Create invoice (requires auth)
- `PUT /api/invoices/:id` - Update invoice (requires auth)
- `DELETE /api/invoices/:id` - Delete invoice (requires auth)

### Recurring Clients
- `GET /api/recurring` - Get all recurring clients (requires auth)
- `POST /api/recurring` - Create recurring client (requires auth)
- `PUT /api/recurring/:id` - Update recurring client (requires auth)
- `DELETE /api/recurring/:id` - Delete recurring client (requires auth)

### Stats
- `GET /api/stats` - Get dashboard statistics (requires auth)

## Deploy to Render

### Option 1: Using Render Blueprint

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repo
5. Select the `render.yaml` file
6. Set the `DATABASE_URL` environment variable (use Internal connection string)
7. Click "Apply"

### Option 2: Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** (leave empty or set to project root)
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
4. Add Environment Variables:
   - `DATABASE_URL` (Internal PostgreSQL URL)
   - `JWT_SECRET` (generate a secure random string)
   - `FRONTEND_URL` (your frontend URL)
   - `NODE_ENV` = `production`
   - `PORT` = `3001`

### Update Frontend API URL

After deploying the backend, update your frontend `.env`:

```env
VITE_API_URL=https://your-api-url.onrender.com
```

## Database Connection Strings

### Local Development (External)
```
postgresql://db_360cleaning_db_user:wsfABRacn3jqoqmXb8jVdBcw10QlbXsv@dpg-d829cvl7vvec73b3v1h0-a.oregon-postgres.render.com/db_360cleaning_db
```

### Production (Internal)
```
postgresql://db_360cleaning_db_user:wsfABRacn3jqoqmXb8jVdBcw10QlbXsv@dpg-d829cvl7vvec73b3v1h0-a/db_360cleaning_db
```

## Troubleshooting

### Connection Issues
If you get connection errors:
1. Verify your DATABASE_URL is correct
2. Check if PostgreSQL is accessible (for local: External URL, for Render: Internal URL)
3. Make sure your IP is whitelisted if using external database

### CORS Errors
If you get CORS errors:
1. Verify `FRONTEND_URL` matches your frontend URL exactly
2. Include the protocol (http:// or https://)

### Authentication Issues
If login doesn't work:
1. Clear localStorage and try again
2. Verify the admin user exists in the database
3. Check browser console for specific errors
