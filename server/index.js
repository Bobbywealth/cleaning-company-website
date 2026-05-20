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

// ============ WALKTHROUGH APPOINTMENTS ROUTES ============
app.get('/api/walkthroughs', authenticateToken, async (req, res) => {
  try {
    const { date, status, lead_id } = req.query;
    let query_str = `
      SELECT wa.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email, l.service as lead_service
      FROM walkthrough_appointments wa
      LEFT JOIN leads l ON wa.lead_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query_str += ` AND wa.scheduled_date = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query_str += ` AND wa.status = $${params.length}`;
    }
    if (lead_id) {
      params.push(lead_id);
      query_str += ` AND wa.lead_id = $${params.length}`;
    }

    query_str += ' ORDER BY wa.scheduled_date ASC, wa.scheduled_time ASC';

    const result = await query(query_str, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get walkthroughs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/walkthroughs', authenticateToken, async (req, res) => {
  try {
    const { lead_id, scheduled_date, scheduled_time, duration_minutes, address, service_type, notes } = req.body;

    const result = await query(
      `INSERT INTO walkthrough_appointments (lead_id, scheduled_date, scheduled_time, duration_minutes, address, service_type, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [lead_id, scheduled_date, scheduled_time, duration_minutes || 60, address, service_type, notes, req.user.username]
    );

    // Auto-update lead status to "Walkthrough Scheduled"
    if (lead_id) {
      await query(
        `UPDATE leads SET status = 'Walkthrough Scheduled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [lead_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create walkthrough error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/walkthroughs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_date, scheduled_time, duration_minutes, address, service_type, status, notes, outcome, quote_amount, follow_up_date } = req.body;

    const result = await query(
      `UPDATE walkthrough_appointments
       SET scheduled_date = COALESCE($1, scheduled_date),
           scheduled_time = COALESCE($2, scheduled_time),
           duration_minutes = COALESCE($3, duration_minutes),
           address = COALESCE($4, address),
           service_type = COALESCE($5, service_type),
           status = COALESCE($6, status),
           notes = COALESCE($7, notes),
           outcome = COALESCE($8, outcome),
           quote_amount = COALESCE($9, quote_amount),
           follow_up_date = COALESCE($10, follow_up_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [scheduled_date, scheduled_time, duration_minutes, address, service_type, status, notes, outcome, quote_amount, follow_up_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Walkthrough not found' });
    }

    // Auto-update lead status based on walkthrough status
    const walkthrough = result.rows[0];
    if (walkthrough.lead_id) {
      let newLeadStatus = null;
      if (status === 'Completed' || status === 'Converted') {
        newLeadStatus = 'Quote Provided';
      } else if (status === 'Cancelled' || status === 'No-Show') {
        newLeadStatus = 'Contacted';
      }

      if (newLeadStatus) {
        await query(
          `UPDATE leads SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [newLeadStatus, walkthrough.lead_id]
        );
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update walkthrough error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/walkthroughs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM walkthrough_appointments WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete walkthrough error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/walkthroughs/check-conflict', authenticateToken, async (req, res) => {
  try {
    const { date, time, duration_minutes, exclude_id } = req.query;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    const duration = parseInt(duration_minutes) || 60;

    // Get all walkthroughs on the same date
    let query_str = `
      SELECT * FROM walkthrough_appointments
      WHERE scheduled_date = $1 AND status NOT IN ('Cancelled', 'No-Show')
    `;
    const params = [date];

    if (exclude_id) {
      params.push(exclude_id);
      query_str += ` AND id != $${params.length}`;
    }

    const result = await query(query_str, params);

    // Check for time conflicts
    const requestedStart = timeToMinutes(time);
    const requestedEnd = requestedStart + duration;

    for (const appt of result.rows) {
      const apptStart = timeToMinutes(appt.scheduled_time);
      const apptEnd = apptStart + (appt.duration_minutes || 60);

      // Check overlap
      if (requestedStart < apptEnd && requestedEnd > apptStart) {
        return res.json({
          hasConflict: true,
          conflictingAppointment: appt
        });
      }
    }

    res.json({ hasConflict: false });
  } catch (error) {
    console.error('Check conflict error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to convert time string to minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// ============ STATS ROUTE ============
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const leadsResult = await query('SELECT COUNT(*) as total FROM leads');
    const newLeadsResult = await query("SELECT COUNT(*) as total FROM leads WHERE status = 'New'");
    const jobsResult = await query('SELECT COUNT(*) as total FROM jobs');
    const bookedJobsResult = await query("SELECT COUNT(*) as total FROM jobs WHERE status IN ('Confirmed', 'Scheduled')");
    const completedJobsResult = await query("SELECT COUNT(*) as total FROM jobs WHERE status = 'Completed'");

    const today = new Date().toISOString().split('T')[0];
    const walkthroughsResult = await query("SELECT COUNT(*) as total FROM walkthrough_appointments WHERE scheduled_date = $1 AND status NOT IN ('Cancelled', 'No-Show')", [today]);
    const scheduledWalkthroughsResult = await query("SELECT COUNT(*) as total FROM walkthrough_appointments WHERE status IN ('Scheduled', 'Confirmed')");

    const totalLeads = parseInt(leadsResult.rows[0].total);
    const totalJobs = parseInt(jobsResult.rows[0].total);
    const completedJobs = parseInt(completedJobsResult.rows[0].total);

    res.json({
      newLeads: parseInt(newLeadsResult.rows[0].total),
      bookedJobs: parseInt(bookedJobsResult.rows[0].total),
      totalJobs,
      completedJobs,
      totalLeads,
      completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      todayWalkthroughs: parseInt(walkthroughsResult.rows[0].total),
      scheduledWalkthroughs: parseInt(scheduledWalkthroughsResult.rows[0].total)
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ AUTOMATED WORKFLOWS ROUTES ============

// Get all workflows
app.get('/api/workflows', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM automated_workflows ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single workflow
app.get('/api/workflows/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM automated_workflows WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create workflow
app.post('/api/workflows', authenticateToken, async (req, res) => {
  try {
    const { name, description, trigger_type, trigger_config, action_type, action_config, is_active } = req.body;

    const result = await query(
      `INSERT INTO automated_workflows (name, description, trigger_type, trigger_config, action_type, action_config, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, trigger_type, JSON.stringify(trigger_config || {}), action_type, JSON.stringify(action_config || {}), is_active !== false]
    );

    await query(
      `INSERT INTO audit_log (action_type, entity_type, entity_id, details, performed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      ['CREATE_WORKFLOW', 'automated_workflows', result.rows[0].id, JSON.stringify({ name }), req.user.username]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update workflow
app.put('/api/workflows/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, trigger_type, trigger_config, action_type, action_config, is_active } = req.body;

    const result = await query(
      `UPDATE automated_workflows
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           trigger_type = COALESCE($3, trigger_type),
           trigger_config = COALESCE($4, trigger_config),
           action_type = COALESCE($5, action_type),
           action_config = COALESCE($6, action_config),
           is_active = COALESCE($7, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, description, trigger_type, trigger_config ? JSON.stringify(trigger_config) : null, action_type, action_config ? JSON.stringify(action_config) : null, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await query(
      `INSERT INTO audit_log (action_type, entity_type, entity_id, details, performed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      ['UPDATE_WORKFLOW', 'automated_workflows', id, JSON.stringify(req.body), req.user.username]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workflow
app.delete('/api/workflows/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM automated_workflows WHERE id = $1', [id]);

    await query(
      `INSERT INTO audit_log (action_type, entity_type, entity_id, details, performed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      ['DELETE_WORKFLOW', 'automated_workflows', id, JSON.stringify({ id }), req.user.username]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Run a specific workflow manually
app.post('/api/workflows/:id/run', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const workflowResult = await query('SELECT * FROM automated_workflows WHERE id = $1', [id]);

    if (workflowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflow = workflowResult.rows[0];
    const results = { executed: false, actions: [], errors: [] };

    // Execute based on action_type
    switch (workflow.action_type) {
      case 'create_recurring_jobs':
        results.actions = await processRecurringJobCreation();
        results.executed = true;
        break;
      case 'check_overdue_invoices':
        results.actions = await processOverdueInvoices();
        results.executed = true;
        break;
      case 'check_stale_leads':
        results.actions = await processStaleLeads(workflow.action_config?.threshold_hours || 72);
        results.executed = true;
        break;
      case 'send_lead_followup':
        results.actions = await processLeadFollowup();
        results.executed = true;
        break;
      default:
        results.errors.push(`Unknown action type: ${workflow.action_type}`);
    }

    // Update workflow run stats
    await query(
      `UPDATE automated_workflows SET last_run_at = CURRENT_TIMESTAMP, run_count = run_count + 1 WHERE id = $1`,
      [id]
    );

    await query(
      `INSERT INTO audit_log (action_type, entity_type, entity_id, details, performed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      ['RUN_WORKFLOW', 'automated_workflows', id, JSON.stringify(results), req.user.username]
    );

    res.json({ success: true, workflow_id: id, results });
  } catch (error) {
    console.error('Run workflow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Run all due workflows
app.post('/api/workflows/run-all', authenticateToken, async (req, res) => {
  try {
    const results = [];
    const workflows = await query('SELECT * FROM automated_workflows WHERE is_active = true');

    for (const workflow of workflows.rows) {
      try {
        let actionResult = [];
        switch (workflow.action_type) {
          case 'create_recurring_jobs':
            actionResult = await processRecurringJobCreation();
            break;
          case 'check_overdue_invoices':
            actionResult = await processOverdueInvoices();
            break;
          case 'check_stale_leads':
            actionResult = await processStaleLeads(workflow.action_config?.threshold_hours || 72);
            break;
          case 'send_lead_followup':
            actionResult = await processLeadFollowup();
            break;
        }

        await query(
          `UPDATE automated_workflows SET last_run_at = CURRENT_TIMESTAMP, run_count = run_count + 1 WHERE id = $1`,
          [workflow.id]
        );

        results.push({ workflow_id: workflow.id, name: workflow.name, success: true, actions: actionResult });
      } catch (err) {
        results.push({ workflow_id: workflow.id, name: workflow.name, success: false, error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Run all workflows error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ SMS SEQUENCES ROUTES ============

app.get('/api/sms-sequences', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM sms_sequences ORDER BY trigger_status, step_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Get SMS sequences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/sms-sequences', authenticateToken, async (req, res) => {
  try {
    const { name, trigger_status, step_order, delay_hours, message_template, is_active } = req.body;

    const result = await query(
      `INSERT INTO sms_sequences (name, trigger_status, step_order, delay_hours, message_template, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, trigger_status, step_order, delay_hours || 0, message_template, is_active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create SMS sequence error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/sms-sequences/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, trigger_status, step_order, delay_hours, message_template, is_active } = req.body;

    const result = await query(
      `UPDATE sms_sequences
       SET name = COALESCE($1, name),
           trigger_status = COALESCE($2, trigger_status),
           step_order = COALESCE($3, step_order),
           delay_hours = COALESCE($4, delay_hours),
           message_template = COALESCE($5, message_template),
           is_active = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [name, trigger_status, step_order, delay_hours, message_template, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SMS sequence not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update SMS sequence error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/sms-sequences/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM sms_sequences WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete SMS sequence error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CREW ZONES ROUTES ============

app.get('/api/crew-zones', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT cz.*, cm.name as crew_name
      FROM crew_zones cz
      LEFT JOIN crew_members cm ON cz.crew_id = cm.id
      ORDER BY cz.zone_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get crew zones error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/crew-zones', authenticateToken, async (req, res) => {
  try {
    const { crew_id, zone_name, zip_codes, priority } = req.body;

    const result = await query(
      `INSERT INTO crew_zones (crew_id, zone_name, zip_codes, priority)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [crew_id, zone_name, zip_codes || [], priority || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create crew zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/crew-zones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { crew_id, zone_name, zip_codes, priority } = req.body;

    const result = await query(
      `UPDATE crew_zones
       SET crew_id = COALESCE($1, crew_id),
           zone_name = COALESCE($2, zone_name),
           zip_codes = COALESCE($3, zip_codes),
           priority = COALESCE($4, priority)
       WHERE id = $5 RETURNING *`,
      [crew_id, zone_name, zip_codes, priority, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crew zone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update crew zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/crew-zones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM crew_zones WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete crew zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-assign crew to job based on zone and availability
app.post('/api/crew/auto-assign', authenticateToken, async (req, res) => {
  try {
    const { job_id } = req.body;

    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];

    // Find available crew in the same zone
    const availableCrew = await query(`
      SELECT cm.*, cz.zone_name, cz.zip_codes
      FROM crew_members cm
      LEFT JOIN crew_zones cz ON cm.id = cz.crew_id
      WHERE cm.status = 'available'
      ORDER BY cm.jobs_today ASC, cz.priority DESC
      LIMIT 1
    `);

    if (availableCrew.rows.length === 0) {
      return res.json({ success: false, message: 'No available crew found' });
    }

    const assignedCrew = availableCrew.rows[0];

    await query(
      `UPDATE jobs SET crew_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [assignedCrew.id, job_id]
    );

    await query(
      `UPDATE crew_members SET jobs_today = jobs_today + 1 WHERE id = $1`,
      [assignedCrew.id]
    );

    res.json({ success: true, crew_id: assignedCrew.id, crew_name: assignedCrew.name });
  } catch (error) {
    console.error('Auto-assign crew error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ NOTIFICATIONS ROUTES ============

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type, status } = req.query;
    let query_str = 'SELECT * FROM notifications';
    const params = [];
    const conditions = [];

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`delivery_status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query_str += ' WHERE ' + conditions.join(' AND ');
    }

    query_str += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(query_str, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id } = req.body;

    const result = await query(
      `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status, sent_at } = req.body;

    const result = await query(
      `UPDATE notifications
       SET delivery_status = COALESCE($1, delivery_status),
           sent_at = COALESCE($2, sent_at)
       WHERE id = $3 RETURNING *`,
      [delivery_status, sent_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ AUDIT LOG ROUTES ============

app.get('/api/audit-log', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0, action_type, entity_type } = req.query;
    let query_str = 'SELECT * FROM audit_log';
    const params = [];
    const conditions = [];

    if (action_type) {
      params.push(action_type);
      conditions.push(`action_type = $${params.length}`);
    }
    if (entity_type) {
      params.push(entity_type);
      conditions.push(`entity_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query_str += ' WHERE ' + conditions.join(' AND ');
    }

    query_str += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(query_str, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ ENHANCED STATS ROUTES ============

app.get('/api/stats/extended', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Revenue stats
    const revenueResult = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_revenue,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as overdue_revenue
      FROM invoices
    `);

    // Jobs stats
    const jobsResult = await query(`
      SELECT
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_jobs,
        COUNT(CASE WHEN status IN ('Pending', 'Confirmed', 'Scheduled') THEN 1 END) as upcoming_jobs,
        COUNT(CASE WHEN date = $1 THEN 1 END) as today_jobs
      FROM jobs
    `, [today]);

    // Crew stats
    const crewResult = await query(`
      SELECT
        COUNT(*) as total_crew,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_crew,
        COUNT(CASE WHEN status = 'busy' THEN 1 END) as busy_crew
      FROM crew_members
    `);

    // Lead conversion stats
    const leadsResult = await query(`
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'New' THEN 1 END) as new_leads,
        COUNT(CASE WHEN status = 'Contacted' THEN 1 END) as contacted_leads,
        COUNT(CASE WHEN status = 'Walkthrough Scheduled' THEN 1 END) as walkthrough_scheduled_leads,
        COUNT(CASE WHEN status = 'Quote Provided' THEN 1 END) as quote_provided_leads,
        COUNT(CASE WHEN status = 'Converted' THEN 1 END) as converted_leads
      FROM leads
    `);

    // Walkthrough stats
    const walkthroughsResult = await query(`
      SELECT
        COUNT(*) as total_walkthroughs,
        COUNT(CASE WHEN status = 'Scheduled' OR status = 'Confirmed' THEN 1 END) as upcoming_walkthroughs,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_walkthroughs,
        COUNT(CASE WHEN status = 'No-Show' THEN 1 END) as no_show_walkthroughs,
        COUNT(CASE WHEN status = 'Converted' THEN 1 END) as converted_walkthroughs,
        COUNT(CASE WHEN scheduled_date = $1 THEN 1 END) as today_walkthroughs
      FROM walkthrough_appointments
    `, [today]);

    // Revenue by day (last 7 days)
    const revenueByDayResult = await query(`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue
      FROM invoices
      WHERE created_at >= $1
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [weekAgo]);

    // Jobs by day (last 7 days)
    const jobsByDayResult = await query(`
      SELECT
        date as job_date,
        COUNT(*) as jobs
      FROM jobs
      WHERE date >= $1
      GROUP BY date
      ORDER BY date
    `, [weekAgo]);

    // Recurring revenue
    const recurringResult = await query(`
      SELECT
        COUNT(*) as total_recurring,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_recurring
      FROM recurring_clients
    `);

    // Lead sources breakdown
    const leadSourcesResult = await query(`
      SELECT
        COALESCE(lead_source, 'Unknown') as source,
        COUNT(*) as count
      FROM leads
      GROUP BY lead_source
      ORDER BY count DESC
    `);

    // Service type breakdown
    const serviceBreakdownResult = await query(`
      SELECT
        COALESCE(service, 'Unknown') as service,
        COUNT(*) as count
      FROM jobs
      GROUP BY service
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      revenue: {
        total: parseFloat(revenueResult.rows[0].total_revenue) || 0,
        pending: parseFloat(revenueResult.rows[0].pending_revenue) || 0,
        overdue: parseFloat(revenueResult.rows[0].overdue_revenue) || 0
      },
      jobs: {
        total: parseInt(jobsResult.rows[0].total_jobs) || 0,
        completed: parseInt(jobsResult.rows[0].completed_jobs) || 0,
        upcoming: parseInt(jobsResult.rows[0].upcoming_jobs) || 0,
        today: parseInt(jobsResult.rows[0].today_jobs) || 0
      },
      crew: {
        total: parseInt(crewResult.rows[0].total_crew) || 0,
        available: parseInt(crewResult.rows[0].available_crew) || 0,
        busy: parseInt(crewResult.rows[0].busy_crew) || 0
      },
      leads: {
        total: parseInt(leadsResult.rows[0].total_leads) || 0,
        new: parseInt(leadsResult.rows[0].new_leads) || 0,
        contacted: parseInt(leadsResult.rows[0].contacted_leads) || 0,
        walkthroughScheduled: parseInt(leadsResult.rows[0].walkthrough_scheduled_leads) || 0,
        quoteProvided: parseInt(leadsResult.rows[0].quote_provided_leads) || 0,
        converted: parseInt(leadsResult.rows[0].converted_leads) || 0,
        conversionRate: parseInt(leadsResult.rows[0].total_leads) > 0
          ? Math.round((parseInt(leadsResult.rows[0].converted_leads) / parseInt(leadsResult.rows[0].total_leads)) * 100)
          : 0
      },
      walkthroughs: {
        total: parseInt(walkthroughsResult.rows[0].total_walkthroughs) || 0,
        upcoming: parseInt(walkthroughsResult.rows[0].upcoming_walkthroughs) || 0,
        completed: parseInt(walkthroughsResult.rows[0].completed_walkthroughs) || 0,
        noShow: parseInt(walkthroughsResult.rows[0].no_show_walkthroughs) || 0,
        converted: parseInt(walkthroughsResult.rows[0].converted_walkthroughs) || 0,
        today: parseInt(walkthroughsResult.rows[0].today_walkthroughs) || 0
      },
      recurring: {
        total: parseInt(recurringResult.rows[0].total_recurring) || 0,
        active: parseInt(recurringResult.rows[0].active_recurring) || 0
      },
      revenueByDay: revenueByDayResult.rows,
      jobsByDay: jobsByDayResult.rows,
      leadSources: leadSourcesResult.rows,
      serviceBreakdown: serviceBreakdownResult.rows
    });
  } catch (error) {
    console.error('Get extended stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ WORKFLOW PROCESSING HELPERS ============

async function processRecurringJobCreation() {
  const results = [];
  const today = new Date().toISOString().split('T')[0];

  const recurringClients = await query(`
    SELECT * FROM recurring_clients
    WHERE status = 'active' AND next_date <= $1
  `, [today]);

  for (const client of recurringClients.rows) {
    try {
      const jobId = `AUTO-${Date.now()}-${client.id}`;
      const serviceName = `${client.plan.charAt(0).toUpperCase() + client.plan.slice(1)} Clean (Recurring)`;

      await query(`
        INSERT INTO jobs (client, phone, email, service, date, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [client.name, client.phone, client.email, serviceName, today, 'Scheduled', `Auto-generated from recurring client #${client.id}`]);

      let nextDate = new Date(today);
      if (client.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (client.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
      else nextDate.setMonth(nextDate.getMonth() + 1);

      await query(`
        UPDATE recurring_clients SET next_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      `, [nextDate.toISOString().split('T')[0], client.id]);

      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['job_created', client.name, client.phone, client.email, `Auto-scheduled: ${serviceName} for ${today}`, 'recurring_client', client.id, 'sent']);

      results.push({ client_id: client.id, client_name: client.name, job_created: true });
    } catch (err) {
      results.push({ client_id: client.id, client_name: client.name, job_created: false, error: err.message });
    }
  }

  return results;
}

async function processOverdueInvoices() {
  const results = [];
  const today = new Date().toISOString().split('T')[0];

  const overdueInvoices = await query(`
    SELECT * FROM invoices
    WHERE status = 'pending' AND due_date < $1
  `, [today]);

  for (const invoice of overdueInvoices.rows) {
    try {
      await query(`
        UPDATE invoices SET status = 'overdue', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [invoice.id]);

      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['invoice_overdue', invoice.client, invoice.phone, invoice.email,
          `Invoice #${invoice.id} is overdue. Amount: $${invoice.amount}. Please remit payment.`,
          'invoice', invoice.id, 'sent']);

      results.push({ invoice_id: invoice.id, marked_overdue: true });
    } catch (err) {
      results.push({ invoice_id: invoice.id, marked_overdue: false, error: err.message });
    }
  }

  return results;
}

async function processStaleLeads(thresholdHours = 72) {
  const results = [];
  const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

  const staleLeads = await query(`
    SELECT * FROM leads
    WHERE status IN ('New', 'Contacted') AND updated_at < $1
  `, [thresholdDate.toISOString()]);

  for (const lead of staleLeads.rows) {
    try {
      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['stale_lead', lead.name, lead.phone, lead.email,
          `Stale lead alert: ${lead.name} (${lead.phone}) - No activity for ${thresholdHours}+ hours. Status: ${lead.status}`,
          'lead', lead.id, 'sent']);

      results.push({ lead_id: lead.id, lead_name: lead.name, alerted: true });
    } catch (err) {
      results.push({ lead_id: lead.id, lead_name: lead.name, alerted: false, error: err.message });
    }
  }

  return results;
}

async function processLeadFollowup() {
  const results = [];
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  const newLeads = await query(`
    SELECT * FROM leads
    WHERE status = 'New' AND created_at < $1
  `, [fourHoursAgo.toISOString()]);

  const sequences = await query(`
    SELECT * FROM sms_sequences
    WHERE trigger_status = 'New' AND is_active = true
    ORDER BY step_order
  `);

  for (const lead of newLeads.rows) {
    for (const seq of sequences.rows) {
      if (seq.delay_hours > 0) {
        const seqThreshold = new Date(Date.now() - seq.delay_hours * 60 * 60 * 1000);
        if (new Date(lead.created_at) > seqThreshold) continue;
      }

      try {
        const message = seq.message_template
          .replace(/{{name}}/g, lead.name)
          .replace(/{{phone}}/g, lead.phone);

        await query(`
          INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        `, ['lead_followup', lead.name, lead.phone, lead.email, message, 'lead', lead.id, 'sent']);

        results.push({ lead_id: lead.id, lead_name: lead.name, sequence: seq.name, sent: true });
      } catch (err) {
        results.push({ lead_id: lead.id, lead_name: lead.name, sequence: seq.name, sent: false, error: err.message });
      }
    }
  }

  return results;
}

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
