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

const QUO_API_KEY = process.env.QUO_API_KEY;
const QUO_API_URL = 'https://api.openphone.com';
const OPENPHONE_NUMBER = process.env.OPENPHONE_NUMBER;

if (!QUO_API_KEY) {
  console.log('⚠️  QUO API not configured - SMS features will be disabled');
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return null;
}

async function sendSMS(to, content) {
  if (!QUO_API_KEY || !OPENPHONE_NUMBER) {
    console.log('⚠️  SMS not sent - QUO API or OpenPhone number not configured');
    return { success: false, error: 'SMS not configured' };
  }

  const normalizedPhone = normalizePhoneNumber(to);
  if (!normalizedPhone) {
    console.log(`⚠️  SMS not sent - invalid phone number: ${to}`);
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const response = await fetch(`${QUO_API_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': QUO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        from: OPENPHONE_NUMBER,
        to: [normalizedPhone],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send SMS');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('QUO SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || '360cleaning_jwt_secret_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_KEY = process.env.API_KEY || '360cleaning_api_key_2026';

// API Key authentication middleware for external access
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === API_KEY) {
    return next();
  }
  // Allow regular auth token or API key
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Invalid token
    }
  }
  // For public endpoints, allow without auth
  next();
};

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
    const { name, phone, email, service, notes, lead_source, business_type, address,
            property_size, bathrooms, frequency, county, city_area, add_ons,
            estimated_low, estimated_high } = req.body;

    // Map service name to service_type for SMS sequences
    const serviceTypeMap = {
      'Residential Cleaning': 'residential',
      'Commercial Cleaning': 'commercial',
      'Deep Cleaning': 'deep',
      'Move In/Out': 'move',
      'Post-Construction': 'construction'
    };
    const serviceType = serviceTypeMap[service] || 'residential';

    const result = await query(
      `INSERT INTO leads (name, phone, email, service, notes, lead_source, business_type, address,
                          property_size, bathrooms, frequency, county, city_area, add_ons,
                          estimated_low, estimated_high, lead_sub_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [name, phone, email, service, notes, lead_source || 'Website', business_type, address,
       property_size, bathrooms, frequency, county, city_area, add_ons ? JSON.stringify(add_ons) : null,
       estimated_low, estimated_high, 'quote_form']
    );

    const newLead = result.rows[0];

    await query(
      `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      ['lead_received', name, phone, email, `New lead received: ${name} - ${phone} - ${service}`, 'lead', newLead.id, 'sent']
    );

    // Initialize SMS sequence state for this lead
    await query(
      `INSERT INTO lead_sms_sequence_state (lead_id, service_type, trigger_status, last_sequence_step, last_sent_at, completed)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newLead.id, serviceType, 'New', 0, new Date().toISOString(), false]
    );

    // Send service-specific welcome SMS
    if (phone) {
      const welcomeMessages = {
        residential: `Hi ${name}! 🏠 Thanks for requesting a quote from 360 Cleaning! We will send your personalized price within 2 hours. Questions? Text back or call (862) 285-4949`,
        commercial: `Hi ${name}! 🏢 Thanks for your commercial cleaning inquiry. We service offices, restaurants, retail & more across NJ. Your quote ready in 2 hours!`,
        deep: `Hi ${name}! ✨ Thanks for your deep cleaning interest! We go above & beyond - scrubbed grout, clean cabinets, detailed baseboards. Price coming in 2 hours!`,
        move: `Hi ${name}! 🚚 Thanks for your move in/out cleaning request! We make spaces move-in ready & help protect your security deposit. Price in 2 hours!`,
        construction: `Hi ${name}! 🏗️ Thanks for your post-construction cleanup request! We handle debris removal, dust & detailed finishing. Price coming in 2 hours!`
      };
      const intakeMsg = welcomeMessages[serviceType] || `Hi ${name}! Thanks for choosing 360 Cleaning Co.! We received your quote request and will contact you within 2 hours. Questions? Call (862) 285-4949`;
      await sendSMS(phone, intakeMsg);
    }

    res.status(201).json(newLead);
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

    const newJob = result.rows[0];

    await query(
      `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      ['job_scheduled', client, phone, email, `Job scheduled: ${service} for ${date}`, 'job', newJob.id, 'sent']
    );

    if (phone) {
      const jobMsg = `Hi ${client}! Your ${service} is scheduled for ${date}. Thank you for choosing 360 Cleaning Co.! Questions? Call (862) 285-4949`;
      await sendSMS(phone, jobMsg);
    }

    res.status(201).json(newJob);
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

    const newClient = result.rows[0];

    await query(
      `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      ['client_onboarded', name, phone, email, `New recurring client: ${name} - ${plan} plan`, 'recurring_client', newClient.id, 'sent']
    );

    if (phone) {
      const welcomeMsg = `Hi ${name}! Welcome to 360 Cleaning Co.! Your ${plan} cleaning plan is active. Next scheduled clean: ${next_date}. Questions? Call (862) 285-4949`;
      await sendSMS(phone, welcomeMsg);
    }

    res.status(201).json(newClient);
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
        COUNT(CASE WHEN status = 'Converted' THEN 1 END) as converted_leads
      FROM leads
    `);

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
        converted: parseInt(leadsResult.rows[0].converted_leads) || 0,
        conversionRate: parseInt(leadsResult.rows[0].total_leads) > 0
          ? Math.round((parseInt(leadsResult.rows[0].converted_leads) / parseInt(leadsResult.rows[0].total_leads)) * 100)
          : 0
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

      const notificationMsg = `Auto-scheduled: ${serviceName} for ${today}`;
      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['job_created', client.name, client.phone, client.email, notificationMsg, 'recurring_client', client.id, 'sent']);

      if (client.phone) {
        await sendSMS(client.phone, notificationMsg);
      }

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

      const notificationMsg = `Invoice #${invoice.id} is overdue. Amount: $${invoice.amount}. Please remit payment.`;
      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['invoice_overdue', invoice.client, invoice.phone, invoice.email,
          notificationMsg,
          'invoice', invoice.id, 'sent']);

      if (invoice.phone) {
        await sendSMS(invoice.phone, notificationMsg);
      }

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
      const notificationMsg = `Stale lead alert: ${lead.name} (${lead.phone}) - No activity for ${thresholdHours}+ hours. Status: ${lead.status}`;
      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['stale_lead', lead.name, lead.phone, lead.email,
          notificationMsg,
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

  // Get leads that need follow-up (status New, Contacted, or Stale, with incomplete sequences)
  const leadsToProcess = await query(`
    SELECT l.*, s.last_sequence_step, s.last_sent_at, s.completed as seq_completed,
           COALESCE(l.service, 'residential') as service_type
    FROM leads l
    LEFT JOIN lead_sms_sequence_state s ON l.id = s.lead_id
    WHERE l.status IN ('New', 'Contacted', 'Stale')
      AND (s.completed IS NULL OR s.completed = FALSE)
  `);

  for (const lead of leadsToProcess.rows) {
    try {
      // Determine service type from lead service
      const serviceTypeMap = {
        'Residential Cleaning': 'residential',
        'Commercial Cleaning': 'commercial',
        'Deep Cleaning': 'deep',
        'Move In/Out': 'move',
        'Post-Construction': 'construction'
      };
      const serviceType = serviceTypeMap[lead.service] || 'residential';

      // Use 'stale' sequence if lead is stale
      const triggerStatus = lead.status === 'Stale' ? 'Stale' : 'New';

      // Get the next sequence step
      const currentStep = lead.last_sequence_step || 0;
      const nextStep = currentStep + 1;

      const seqResult = await query(`
        SELECT * FROM service_sms_sequences
        WHERE service_type = $1 AND trigger_status = $2 AND sequence_order = $3 AND is_active = true
      `, [serviceType, triggerStatus, nextStep]);

      if (seqResult.rows.length === 0) {
        continue;
      }

      const seq = seqResult.rows[0];

      // Check if enough time has passed since last sent
      if (lead.last_sent_at) {
        const timeSinceLastSent = Date.now() - new Date(lead.last_sent_at).getTime();
        const delayMs = seq.delay_hours * 60 * 60 * 1000;
        if (timeSinceLastSent < delayMs) {
          continue;
        }
      } else {
        // First message - check if enough time since lead created
        const timeSinceCreated = Date.now() - new Date(lead.created_at).getTime();
        const delayMs = seq.delay_hours * 60 * 60 * 1000;
        if (timeSinceCreated < delayMs) {
          continue;
        }
      }

      // Replace placeholders in message
      const message = seq.message_template
        .replace(/{{name}}/g, lead.name)
        .replace(/{{phone}}/g, lead.phone)
        .replace(/{{service}}/g, lead.service || '')
        .replace(/{{county}}/g, lead.county || '')
        .replace(/{{estimated_price}}/g, lead.estimated_low ? `$${lead.estimated_low}` : '');

      // Save notification
      await query(`
        INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      `, ['lead_followup', lead.name, lead.phone, lead.email, message, 'lead', lead.id, 'sent']);

      // Send SMS
      if (lead.phone) {
        const smsResult = await sendSMS(lead.phone, message);
        if (!smsResult.success) {
          console.log(`SMS failed for ${lead.name}: ${smsResult.error}`);
        }
      }

      // Update sequence state
      await query(`
        INSERT INTO lead_sms_sequence_state (lead_id, service_type, trigger_status, last_sequence_step, last_sent_at, completed)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (lead_id, service_type, trigger_status)
        DO UPDATE SET last_sequence_step = $4, last_sent_at = $5
      `, [lead.id, serviceType, triggerStatus, nextStep, new Date().toISOString()]);

      // Check if this was the last step in the sequence
      const lastStepResult = await query(`
        SELECT MAX(sequence_order) as max_step FROM service_sms_sequences
        WHERE service_type = $1 AND trigger_status = $2 AND is_active = true
      `, [serviceType, triggerStatus]);

      const maxStep = lastStepResult.rows[0].max_step;
      if (nextStep >= maxStep) {
        await query(`
          UPDATE lead_sms_sequence_state SET completed = TRUE, completed_at = CURRENT_TIMESTAMP
          WHERE lead_id = $1 AND service_type = $2 AND trigger_status = $3
        `, [lead.id, serviceType, triggerStatus]);
      }

      results.push({ lead_id: lead.id, lead_name: lead.name, sequence_step: nextStep, sent: true });
    } catch (err) {
      console.error(`Error processing lead ${lead.id}:`, err.message);
      results.push({ lead_id: lead.id, lead_name: lead.name, sent: false, error: err.message });
    }
  }

  return results;
}

// ============ INVENTORY ROUTES ============

app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM inventory ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const { name, category, unit, quantity, min_quantity, cost_per_unit, supplier } = req.body;

    const result = await query(
      `INSERT INTO inventory (name, category, unit, quantity, min_quantity, cost_per_unit, supplier)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, category, unit, quantity || 0, min_quantity || 0, cost_per_unit || 0, supplier]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit, quantity, min_quantity, cost_per_unit, supplier } = req.body;

    const result = await query(
      `UPDATE inventory SET name = COALESCE($1, name), category = COALESCE($2, category),
       unit = COALESCE($3, unit), quantity = COALESCE($4, quantity), min_quantity = COALESCE($5, min_quantity),
       cost_per_unit = COALESCE($6, cost_per_unit), supplier = COALESCE($7, supplier),
       updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
      [name, category, unit, quantity, min_quantity, cost_per_unit, supplier, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM inventory WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/inventory/low-stock', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM inventory WHERE quantity <= min_quantity ORDER BY quantity ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ COMMISSIONS & PAYROLL ROUTES ============

app.get('/api/commissions', authenticateToken, async (req, res) => {
  try {
    const { crew_id, status, pay_period } = req.query;
    let query_str = `
      SELECT c.*, cm.name as crew_name
      FROM commissions c
      LEFT JOIN crew_members cm ON c.crew_id = cm.id
      WHERE 1=1
    `;
    const params = [];

    if (crew_id) {
      params.push(crew_id);
      query_str += ` AND c.crew_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query_str += ` AND c.status = $${params.length}`;
    }
    if (pay_period) {
      params.push(pay_period);
      query_str += ` AND c.pay_period = $${params.length}`;
    }

    query_str += ' ORDER BY c.created_at DESC';
    const result = await query(query_str, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/commissions/calculate', authenticateToken, async (req, res) => {
  try {
    const { crew_id, job_id, commission_rate } = req.body;

    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [job_id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];
    const invoiceResult = await query(
      'SELECT amount FROM invoices WHERE client = $1 AND status = $2',
      [job.client, 'paid']
    );

    let amount = 0;
    if (invoiceResult.rows.length > 0) {
      amount = parseFloat(invoiceResult.rows[0].amount) * (commission_rate || 0.10);
    }

    const result = await query(
      `INSERT INTO commissions (crew_id, job_id, amount, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [crew_id, job_id, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Calculate commission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/commissions/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE commissions SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Commission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Pay commission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/payroll/summary', authenticateToken, async (req, res) => {
  try {
    const { pay_period } = req.query;

    const result = await query(`
      SELECT cm.id, cm.name, cm.role,
        COALESCE(SUM(c.amount), 0) as total_commissions,
        COUNT(CASE WHEN c.status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_count
      FROM crew_members cm
      LEFT JOIN commissions c ON cm.id = c.crew_id
      ${pay_period ? ' AND c.pay_period = $1' : ''}
      GROUP BY cm.id, cm.name, cm.role
      ORDER BY cm.name
    `, pay_period ? [pay_period] : []);

    res.json(result.rows);
  } catch (error) {
    console.error('Get payroll summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INTEGRATIONS ROUTES ============

app.get('/api/integrations', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT id, service_name, is_active, last_sync_at, created_at FROM integrations ORDER BY service_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/integrations', authenticateToken, async (req, res) => {
  try {
    const { service_name, access_token, refresh_token, expires_at, settings } = req.body;

    const result = await query(
      `INSERT INTO integrations (service_name, access_token, refresh_token, expires_at, settings, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [service_name, access_token, refresh_token, expires_at, JSON.stringify(settings || {})]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/integrations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, access_token, refresh_token, expires_at, settings } = req.body;

    const result = await query(
      `UPDATE integrations SET is_active = COALESCE($1, is_active),
       access_token = COALESCE($2, access_token), refresh_token = COALESCE($3, refresh_token),
       expires_at = COALESCE($4, expires_at), settings = COALESCE($5, settings),
       updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
      [is_active, access_token, refresh_token, expires_at, settings ? JSON.stringify(settings) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/integrations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM integrations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/integrations/:id/sync', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const integration = await query('SELECT * FROM integrations WHERE id = $1', [id]);

    if (integration.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    await query(
      'UPDATE integrations SET last_sync_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({ success: true, message: `${integration.rows[0].service_name} sync triggered`, last_sync_at: new Date().toISOString() });
  } catch (error) {
    console.error('Sync integration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CUSTOMER PORTAL ROUTES ============

app.post('/api/portal/register', async (req, res) => {
  try {
    const { email, password, customer_name, phone } = req.body;

    const existing = await query('SELECT id FROM customer_portal_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const verificationToken = Math.random().toString(36).substring(2, 15);
    const result = await query(
      `INSERT INTO customer_portal_users (email, password, customer_name, phone, verification_token)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, customer_name, phone, is_verified`,
      [email, password, customer_name, phone, verificationToken]
    );

    res.status(201).json({ success: true, user: result.rows[0], verification_token: verificationToken });
  } catch (error) {
    console.error('Portal register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/portal/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, email, customer_name, phone, is_verified FROM customer_portal_users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email, type: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: result.rows[0] });
  } catch (error) {
    console.error('Portal login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/jobs', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }

    const userResult = await query('SELECT customer_name, phone FROM customer_portal_users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { customer_name, phone } = userResult.rows[0];
    const jobsResult = await query(
      'SELECT * FROM jobs WHERE client = $1 OR phone = $2 ORDER BY date DESC LIMIT 50',
      [customer_name, phone]
    );

    res.json(jobsResult.rows);
  } catch (error) {
    console.error('Get portal jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portal/invoices', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'customer') {
      return res.status(403).json({ error: 'Customer access required' });
    }

    const userResult = await query('SELECT customer_name, phone FROM customer_portal_users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { customer_name, phone } = userResult.rows[0];
    const invoicesResult = await query(
      'SELECT * FROM invoices WHERE client = $1 OR email = $2 ORDER BY date DESC LIMIT 50',
      [customer_name, decoded.email]
    );

    res.json(invoicesResult.rows);
  } catch (error) {
    console.error('Get portal invoices error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INBOUND SMS & TWO-WAY SMS ROUTES ============

app.post('/api/sms/inbound', async (req, res) => {
  try {
    const { from, to, message } = req.body;

    const keyword = message.trim().toUpperCase().split(' ')[0];
    let response = 'Thank you for your message. We will get back to you shortly.';

    if (keyword === 'STOP') {
      response = 'You have been unsubscribed from SMS notifications. Reply START to resubscribe.';
    } else if (keyword === 'START') {
      response = 'Welcome back! You have been resubscribed to SMS notifications.';
    } else if (keyword === 'DONE' || keyword === 'COMPLETE') {
      response = 'Thank you for confirming! We will update your job status.';
    } else if (keyword === 'RESCHEDULE') {
      response = 'To reschedule, please call us at (862) 285-4949 or visit your customer portal.';
    } else if (keyword === 'CONFIRM') {
      response = 'Your appointment is confirmed! We look forward to seeing you.';
    }

    await query(
      `INSERT INTO inbound_sms (from_number, to_number, message, keyword, processed, response_sent)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [from, to, message, keyword, response]
    );

    res.json({ success: true, response });
  } catch (error) {
    console.error('Inbound SMS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/sms/inbound', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const result = await query(
      'SELECT * FROM inbound_sms ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get inbound SMS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CHATBOT ROUTES ============

app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { session_id, from_number, email, message } = req.body;

    let conversationResult = await query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1 AND status = $2',
      [session_id, 'active']
    );

    let conversationId;
    if (conversationResult.rows.length === 0) {
      const newConv = await query(
        `INSERT INTO chatbot_conversations (session_id, from_number, email, messages, status)
         VALUES ($1, $2, $3, '[]', 'active') RETURNING id`,
        [session_id || Math.random().toString(36).substring(2, 15), from_number, email]
      );
      conversationId = newConv.rows[0].id;
    } else {
      conversationId = conversationResult.rows[0].id;
    }

    const botResponses = generateBotResponse(message);

    await query(
      `UPDATE chatbot_conversations SET messages = messages || $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify([{ from: 'customer', text: message, timestamp: new Date().toISOString() }, ...botResponses.map(r => ({ from: 'bot', text: r, timestamp: new Date().toISOString() }))]), conversationId]
    );

    res.json({ success: true, responses: botResponses, session_id: session_id });
  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function generateBotResponse(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('quote')) {
    return ['Our commercial cleaning services start at $150 for a standard office. For a customized quote, please call (862) 285-4949 or request a quote on our website.'];
  }
  if (lowerMsg.includes('hour') || lowerMsg.includes('open') || lowerMsg.includes('close') || lowerMsg.includes('available')) {
    return ['We are available Monday-Friday, 8AM-6PM, and Saturday 9AM-4PM. Emergency after-hours service is available by appointment.'];
  }
  if (lowerMsg.includes('service') || lowerMsg.includes('clean')) {
    return ['We offer: Office Cleaning, Post-Construction, Move-in/Move-out, Deep Cleaning, and Recurring Maintenance. Which service are you interested in?'];
  }
  if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('call')) {
    return ['You can reach us at (862) 285-4949 or email info@360cleaningco.com. We would love to hear from you!'];
  }
  if (lowerMsg.includes('book') || lowerMsg.includes('schedule') || lowerMsg.includes('appointment')) {
    return ['To schedule a cleaning, please call us at (862) 285-4949 or visit our website to request a quote. We will get back to you within 2 hours!'];
  }
  if (lowerMsg.includes('thank')) {
    return ['Thank you for choosing 360 Cleaning Co.! Is there anything else I can help you with?'];
  }

  return ['I am here to help! You can ask me about our services, pricing, or how to schedule a cleaning. You can also call us at (862) 285-4949 for immediate assistance.'];
}

app.get('/api/chatbot/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM chatbot_conversations ORDER BY updated_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get chatbot conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ ROUTE OPTIMIZATION ROUTES ============

app.get('/api/routes/optimize', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    const jobsResult = await query(`
      SELECT j.*, cz.zone_name, cz.zip_codes
      FROM jobs j
      LEFT JOIN leads l ON j.client = l.name OR j.phone = l.phone
      LEFT JOIN crew_zones cz ON l.address SIMILAR TO '%(' || array_to_string(cz.zip_codes, '|') || ')%'
      WHERE j.date = $1 AND j.status IN ('Scheduled', 'Confirmed')
      ORDER BY j.date
    `, [date || new Date().toISOString().split('T')[0]]);

    const jobs = jobsResult.rows;
    const zones = {};

    for (const job of jobs) {
      const zone = job.zone_name || 'Unassigned';
      if (!zones[zone]) {
        zones[zone] = [];
      }
      zones[zone].push(job);
    }

    const optimizedRoutes = Object.entries(zones).map(([zone, zoneJobs]) => ({
      zone,
      jobs: zoneJobs,
      estimated_duration: zoneJobs.length * 90,
      job_count: zoneJobs.length
    }));

    res.json({ routes: optimizedRoutes, total_jobs: jobs.length });
  } catch (error) {
    console.error('Optimize routes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/routes/zones', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT cz.*, cm.name as crew_name,
        (SELECT COUNT(*) FROM jobs j WHERE j.date = CURRENT_DATE AND j.crew_id = cm.id) as assigned_jobs
      FROM crew_zones cz
      LEFT JOIN crew_members cm ON cz.crew_id = cm.id
      ORDER BY cz.zone_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ NOTIFICATION TEMPLATES ROUTES ============

app.get('/api/notification-templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      { id: 'lead_received', name: 'Lead Received', subject: 'New Lead Notification', message: 'New lead received: {{name}} - {{phone}} - {{service}}' },
      { id: 'job_scheduled', name: 'Job Scheduled', subject: 'Job Scheduled', message: 'Your cleaning is scheduled for {{date}}. Crew: {{crew}}' },
      { id: 'job_completed', name: 'Job Completed', subject: 'Job Completed', message: 'Your cleaning has been completed. Thank you for choosing 360 Cleaning Co.!' },
      { id: 'invoice_sent', name: 'Invoice Sent', subject: 'Invoice #{{invoice_id}}', message: 'Invoice #{{invoice_id}} for ${{amount}} is due on {{due_date}}.' },
      { id: 'payment_received', name: 'Payment Received', subject: 'Payment Confirmed', message: 'Thank you! We received your payment of ${{amount}}.' },
      { id: 'reminder', name: 'Service Reminder', subject: 'Upcoming Service', message: 'Reminder: Your cleaning service is scheduled for {{date}}.' }
    ];
    res.json(templates);
  } catch (error) {
    console.error('Get notification templates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/notifications/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { template_id, recipient_type, recipient_ids, custom_message } = req.body;

    const templates = {
      lead_received: 'New lead received: {{name}} - {{phone}} - {{service}}',
      job_scheduled: 'Your cleaning is scheduled for {{date}}. Crew: {{crew}}',
      job_completed: 'Your cleaning has been completed. Thank you for choosing 360 Cleaning Co.!',
      invoice_sent: 'Invoice #{{invoice_id}} for ${{amount}} is due on {{due_date}}.',
      payment_received: 'Thank you! We received your payment of ${{amount}}.',
      reminder: 'Reminder: Your cleaning service is scheduled for {{date}}.'
    };

    const templateMessage = custom_message || templates[template_id] || 'Message from 360 Cleaning Co.';

    let recipients = [];
    if (recipient_type === 'leads') {
      const result = await query('SELECT name, phone, email, service FROM leads WHERE id = ANY($1)', [recipient_ids]);
      recipients = result.rows;
    } else if (recipient_type === 'clients') {
      const result = await query('SELECT name, phone, email FROM recurring_clients WHERE id = ANY($1)', [recipient_ids]);
      recipients = result.rows;
    }

    const sent = [];
    const failed = [];
    for (const r of recipients) {
      const message = templateMessage
        .replace(/{{name}}/g, r.name)
        .replace(/{{phone}}/g, r.phone)
        .replace(/{{service}}/g, r.service || '')
        .replace(/{{email}}/g, r.email || '')
        .replace(/{{date}}/g, r.date || '')
        .replace(/{{crew}}/g, r.crew || '')
        .replace(/{{invoice_id}}/g, r.invoice_id || r.id || '')
        .replace(/{{amount}}/g, r.amount || '')
        .replace(/{{due_date}}/g, r.due_date || '');

      await query(
        `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, delivery_status, sent_at)
         VALUES ($1, $2, $3, $4, $5, 'sent', CURRENT_TIMESTAMP)`,
        [template_id, r.name, r.phone, r.email, message]
      );

      if (r.phone) {
        const smsResult = await sendSMS(r.phone, message);
        if (smsResult.success) {
          sent.push(r.name);
        } else {
          failed.push({ name: r.name, error: smsResult.error });
        }
      } else {
        sent.push(r.name);
      }
    }

    res.json({ success: true, sent_count: sent.length, sms_sent: sent.length, recipients: sent, failed });
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ MARKETING API ROUTES ============

// Get marketing statistics
app.get('/api/marketing/stats', authenticateToken, async (req, res) => {
  try {
    const totalLeads = await query('SELECT COUNT(*) as count FROM leads');
    const leadsByStatus = await query(`
      SELECT status, COUNT(*) as count FROM leads GROUP BY status
    `);
    const leadsByService = await query(`
      SELECT service, COUNT(*) as count FROM leads WHERE service IS NOT NULL GROUP BY service
    `);
    const smsSent = await query(`
      SELECT COUNT(*) as count FROM notifications WHERE type IN ('lead_followup', 'lead_received') AND delivery_status = 'sent'
    `);
    const recentLeads = await query(`
      SELECT * FROM leads ORDER BY created_at DESC LIMIT 10
    `);

    const convertedLeads = await query(`
      SELECT COUNT(*) as count FROM leads WHERE status = 'Converted'
    `);

    res.json({
      total_leads: parseInt(totalLeads.rows[0].count),
      converted_leads: parseInt(convertedLeads.rows[0].count),
      leads_by_status: leadsByStatus.rows,
      leads_by_service: leadsByService.rows,
      sms_sent: parseInt(smsSent.rows[0].count),
      recent_leads: recentLeads.rows
    });
  } catch (error) {
    console.error('Get marketing stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leads with SMS history for marketing
app.get('/api/marketing/leads', authenticateToken, async (req, res) => {
  try {
    const { service, status, limit = 100, offset = 0 } = req.query;

    let query_str = 'SELECT l.*, s.last_sequence_step, s.completed as seq_completed FROM leads l LEFT JOIN lead_sms_sequence_state s ON l.id = s.lead_id WHERE 1=1';
    const params = [];

    if (service && service !== 'all') {
      params.push(service);
      query_str += ` AND l.service = $${params.length}`;
    }
    if (status && status !== 'all') {
      params.push(status);
      query_str += ` AND l.status = $${params.length}`;
    }

    query_str += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(query_str, params);

    // Get SMS history for these leads
    const leadIds = result.rows.map(r => r.id);
    let smsHistory = [];
    if (leadIds.length > 0) {
      const historyResult = await query(`
        SELECT * FROM notifications
        WHERE related_entity_id = ANY($1) AND related_entity_type = 'lead'
        ORDER BY sent_at DESC
      `, [leadIds]);
      smsHistory = historyResult.rows;
    }

    // Attach SMS history to each lead
    const leadsWithHistory = result.rows.map(lead => ({
      ...lead,
      sms_history: smsHistory.filter(h => h.related_entity_id === lead.id)
    }));

    res.json(leadsWithHistory);
  } catch (error) {
    console.error('Get marketing leads error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send single SMS to a lead
app.post('/api/marketing/send-single', authenticateToken, async (req, res) => {
  try {
    const { lead_id, message } = req.body;

    if (!lead_id || !message) {
      return res.status(400).json({ error: 'lead_id and message are required' });
    }

    const leadResult = await query('SELECT * FROM leads WHERE id = $1', [lead_id]);
    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    // Save notification
    await query(
      `INSERT INTO notifications (type, recipient_name, recipient_phone, recipient_email, message, related_entity_type, related_entity_id, delivery_status, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      ['marketing_sms', lead.name, lead.phone, lead.email, message, 'lead', lead.id, 'sent']
    );

    // Send SMS
    let smsResult = { success: false };
    if (lead.phone) {
      smsResult = await sendSMS(lead.phone, message);
    }

    res.json({
      success: true,
      lead_id,
      sms_sent: smsResult.success,
      error: smsResult.success ? null : smsResult.error
    });
  } catch (error) {
    console.error('Send single SMS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service SMS sequences for template management
app.get('/api/service-sms-sequences', authenticateToken, async (req, res) => {
  try {
    const { service_type } = req.query;

    let query_str = 'SELECT * FROM service_sms_sequences WHERE 1=1';
    const params = [];

    if (service_type && service_type !== 'all') {
      params.push(service_type);
      query_str += ` AND service_type = $${params.length}`;
    }

    query_str += ' ORDER BY service_type, sequence_order';

    const result = await query(query_str, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get service SMS sequences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a service SMS sequence
app.put('/api/service-sms-sequences/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message_template, delay_hours, is_active } = req.body;

    const result = await query(
      `UPDATE service_sms_sequences
       SET message_template = COALESCE($1, message_template),
           delay_hours = COALESCE($2, delay_hours),
           is_active = COALESCE($3, is_active)
       WHERE id = $4
       RETURNING *`,
      [message_template, delay_hours, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update service SMS sequence error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get distinct service types for filtering
app.get('/api/marketing/service-types', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT service FROM leads WHERE service IS NOT NULL ORDER BY service
    `);
    res.json(result.rows.map(r => r.service));
  } catch (error) {
    console.error('Get service types error:', error);
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
