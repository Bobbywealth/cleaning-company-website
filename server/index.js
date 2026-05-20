import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { query, initializeDatabase } from './db.js';

dotenv.config();

// Initialize email transporter
const emailTransporter = process.env.SMTP_HOST
  ? nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

if (!emailTransporter) {
  console.log('⚠️  Email not configured - SMTP_HOST not set. Invoice emails will be logged only.');
}

// Initialize Stripe conditionally (only if API key is available)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

if (!stripe) {
  console.log('⚠️  Stripe not configured - payment features will be disabled');
}

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

// Create HTTP server with Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat_message', (data) => {
    console.log('Chat message received:', data);
    // Broadcast to all clients except sender
    socket.broadcast.emit('chat_message', {
      type: 'chat_message',
      chatId: data.chatId,
      text: data.text,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

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
    const { name, phone, email, service, notes, lead_source, business_type, address } = req.body;
    
    const result = await query(
      `INSERT INTO leads (name, phone, email, service, notes, lead_source, business_type, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, phone, email, service, notes, lead_source || 'Website', business_type, address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk import leads from CSV
app.post('/api/leads/bulk', authenticateToken, async (req, res) => {
  try {
    const { leads } = req.body;
    
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'No leads provided' });
    }

    const insertedLeads = [];
    for (const lead of leads) {
      const result = await query(
        `INSERT INTO leads (name, phone, email, service, notes, lead_source, business_type, address, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          lead.name || '', 
          lead.phone || '', 
          lead.email || '', 
          lead.service || 'Commercial Cleaning',
          lead.notes || '',
          lead.lead_source || 'Cold Call',
          lead.business_type || '',
          lead.address || '',
          'New'
        ]
      );
      insertedLeads.push(result.rows[0]);
    }
    
    res.status(201).json({ 
      success: true, 
      count: insertedLeads.length,
      leads: insertedLeads
    });
  } catch (error) {
    console.error('Bulk import error:', error);
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

// ============ EMAIL ROUTES ============
app.post('/api/invoices/send', authenticateToken, async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ error: 'Invoice ID required' });
    }

    // Fetch the invoice from database
    const result = await query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = result.rows[0];

    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px; border-radius: 16px 16px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 28px;">360 Cleaning Co.</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Professional Cleaning Services in New Jersey</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin-top: 0;">Invoice #${invoice.id}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Client</td>
              <td style="padding: 10px 0; font-weight: bold; text-align: right;">${invoice.client}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Service</td>
              <td style="padding: 10px 0; text-align: right;">${invoice.service || 'Cleaning Service'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Date</td>
              <td style="padding: 10px 0; text-align: right;">${invoice.date || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b;">Due Date</td>
              <td style="padding: 10px 0; text-align: right;">${invoice.due_date || 'Net 14'}</td>
            </tr>
            <tr style="border-top: 2px solid #e2e8f0;">
              <td style="padding: 15px 0; font-size: 20px; font-weight: bold; color: #1e293b;">Amount Due</td>
              <td style="padding: 15px 0; font-size: 24px; font-weight: bold; text-align: right; color: #06b6d4;">$${parseFloat(invoice.amount || 0).toFixed(2)}</td>
            </tr>
          </table>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px;">
            <p style="margin: 0; color: #64748b; font-size: 14px; text-align: center;">
              Thank you for your business! For questions, contact us at info@360cleaningco.com or (862) 285-4949
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"360 Cleaning Co." <noreply@360cleaningco.com>',
      to: invoice.email,
      subject: `Invoice #${invoice.id} from 360 Cleaning Co.`,
      html: invoiceHtml,
    };

    if (emailTransporter) {
      await emailTransporter.sendMail(mailOptions);
      console.log(`Invoice email sent to ${invoice.email} for invoice ${invoice.id}`);
      res.json({ success: true, message: 'Email sent successfully' });
    } else {
      // Log the email instead of sending when SMTP is not configured
      console.log('📧 Invoice email (simulated):', mailOptions);
      res.json({ success: true, message: 'Email logged (SMTP not configured)' });
    }
  } catch (error) {
    console.error('Send invoice email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
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

// ============ STRIPE PAYMENT ROUTES ============

// Create a payment intent
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, invoiceId, clientEmail, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({ error: 'Payment processing not configured' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoiceId || '',
        clientEmail: clientEmail || '',
      },
      description: description || `Payment for Invoice ${invoiceId}`,
      receipt_email: clientEmail,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ error: error.message || 'Payment processing error' });
  }
});

// Get Stripe publishable key
app.get('/api/payments/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  });
});

// Webhook for Stripe events
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.log('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update invoice status to paid here if needed
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.log('Payment failed:', failedIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
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

    httpServer.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`💬 Socket.IO ready for live chat`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
