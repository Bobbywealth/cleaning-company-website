import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { query, initializeDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || '360cleaning_jwt_secret_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await query(
      'SELECT id, username FROM admin_users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ success: true, token, user: { username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============ LEADS ROUTES ============
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM leads ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { name, phone, email, service, notes } = req.body;
    
    const result = await query(
      `INSERT INTO leads (name, phone, email, service, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, phone, email, service, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, service, notes, status } = req.body;
    
    const result = await query(
      `UPDATE leads 
       SET name = $1, phone = $2, email = $3, service = $4, notes = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [name, phone, email, service, notes, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM leads WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ JOBS ROUTES ============
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM jobs ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const { client, phone, email, service, date, status, notes, crew_id } = req.body;
    
    const result = await query(
      `INSERT INTO jobs (client, phone, email, service, date, status, notes, crew_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [client, phone, email, service, date, status || 'Pending', notes, crew_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { client, phone, email, service, date, status, notes, crew_id } = req.body;
    
    const result = await query(
      `UPDATE jobs 
       SET client = $1, phone = $2, email = $3, service = $4, date = $5, status = $6, notes = $7, crew_id = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [client, phone, email, service, date, status, notes, crew_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CREW ROUTES ============
app.get('/api/crew', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM crew_members ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get crew error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/crew', authenticateToken, async (req, res) => {
  try {
    const { name, role, phone, email, status, jobs_today } = req.body;
    
    const result = await query(
      `INSERT INTO crew_members (name, role, phone, email, status, jobs_today) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, role, phone, email, status || 'available', jobs_today || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create crew member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/crew/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, email, status, jobs_today } = req.body;
    
    const result = await query(
      `UPDATE crew_members 
       SET name = $1, role = $2, phone = $3, email = $4, status = $5, jobs_today = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [name, role, phone, email, status, jobs_today, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crew member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update crew member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/crew/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM crew_members WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete crew member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INVOICES ROUTES ============
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM invoices ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { id, client, email, amount, status, date, due_date } = req.body;
    
    const result = await query(
      `INSERT INTO invoices (id, client, email, amount, status, date, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [id, client, email, amount, status || 'pending', date || new Date().toISOString().split('T')[0], due_date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { client, email, amount, status, date, due_date } = req.body;
    
    const result = await query(
      `UPDATE invoices 
       SET client = $1, email = $2, amount = $3, status = $4, date = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [client, email, amount, status, date, due_date, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM invoices WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ RECURRING CLIENTS ROUTES ============
app.get('/api/recurring', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM recurring_clients ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get recurring clients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/recurring', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, plan, frequency, price, next_date, status } = req.body;
    
    const result = await query(
      `INSERT INTO recurring_clients (name, phone, email, plan, frequency, price, next_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, phone, email, plan, frequency, price, next_date, status || 'active']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create recurring client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/recurring/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, plan, frequency, price, next_date, status } = req.body;
    
    const result = await query(
      `UPDATE recurring_clients 
       SET name = $1, phone = $2, email = $3, plan = $4, frequency = $5, price = $6, next_date = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [name, phone, email, plan, frequency, price, next_date, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update recurring client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/recurring/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM recurring_clients WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete recurring client error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ STATS ROUTE ============
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const leadsResult = await query('SELECT COUNT(*) as total FROM leads');
    const newLeadsResult = await query("SELECT COUNT(*) as total FROM leads WHERE status = 'New'");
    const jobsResult = await query('SELECT COUNT(*) as total FROM jobs');
    const bookedJobsResult = await query("SELECT COUNT(*) as total FROM jobs WHERE status IN ('Confirmed', 'Scheduled')");
    const completedJobsResult = await query("SELECT COUNT(*) as total FROM jobs WHERE status = 'Completed'");

    const totalLeads = parseInt(leadsResult.rows[0].total);
    const totalJobs = parseInt(jobsResult.rows[0].total);
    const completedJobs = parseInt(completedJobsResult.rows[0].total);

    res.json({
      newLeads: parseInt(newLeadsResult.rows[0].total),
      bookedJobs: parseInt(bookedJobsResult.rows[0].total),
      totalJobs,
      completedJobs,
      totalLeads,
      completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Initializing database...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
