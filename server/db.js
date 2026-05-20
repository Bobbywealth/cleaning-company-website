import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

export const initializeDatabase = async () => {
  try {
    // Create leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
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
      )
    `);
    console.log('✓ Leads table ready');

    // Add columns if they don't exist (for existing databases)
    try {
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT 'Website'`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_type VARCHAR(100)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS address TEXT`);
    } catch (e) {
      // Columns may already exist, ignore
    }

    // Create jobs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
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
      )
    `);
    console.log('✓ Jobs table ready');

    // Create crew_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crew_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'available',
        jobs_today INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Crew members table ready');

    // Create invoices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        client VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        amount DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        date DATE DEFAULT CURRENT_DATE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Invoices table ready');

    // Create recurring_clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_clients (
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
      )
    `);
    console.log('✓ Recurring clients table ready');

    // Create admin_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Admin users table ready');

    // Insert default admin if not exists
    const adminExists = await pool.query(
      "SELECT id FROM admin_users WHERE username = 'admin'"
    );
    if (adminExists.rows.length === 0) {
      await pool.query(
        "INSERT INTO admin_users (username, password) VALUES ('admin', '360cleaning2026')"
      );
      console.log('✓ Default admin user created');
    }

    // Create automated_workflows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS automated_workflows (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_type VARCHAR(50) NOT NULL,
        trigger_config JSONB,
        action_type VARCHAR(50) NOT NULL,
        action_config JSONB,
        is_active BOOLEAN DEFAULT true,
        last_run_at TIMESTAMP,
        run_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Automated workflows table ready');

    // Create sms_sequences table for lead nurturing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_sequences (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        trigger_status VARCHAR(50) NOT NULL,
        step_order INTEGER NOT NULL,
        delay_hours INTEGER DEFAULT 0,
        message_template TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ SMS sequences table ready');

    // Create crew_zones table for geographic assignment
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crew_zones (
        id SERIAL PRIMARY KEY,
        crew_id INTEGER REFERENCES crew_members(id) ON DELETE CASCADE,
        zone_name VARCHAR(100) NOT NULL,
        zip_codes TEXT[],
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Crew zones table ready');

    // Create notifications table for tracking sent notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient_name VARCHAR(255),
        recipient_phone VARCHAR(50),
        recipient_email VARCHAR(255),
        message TEXT,
        delivery_status VARCHAR(50) DEFAULT 'pending',
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Notifications table ready');

    // Create audit_log table for automation actions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        action_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INTEGER,
        details JSONB,
        performed_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Audit log table ready');

    // Insert default SMS sequences for lead nurturing
    const smsSeqExists = await pool.query("SELECT id FROM sms_sequences LIMIT 1");
    if (smsSeqExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO sms_sequences (name, trigger_status, step_order, delay_hours, message_template, is_active) VALUES
        ('New Lead Welcome', 'New', 1, 0, 'Hi {{name}}! Thanks for choosing 360 Cleaning Co.! We received your quote request and will contact you within 2 hours. Questions? Call (862) 285-4949 🧹', true),
        ('New Lead Follow-up', 'New', 2, 4, 'Hi {{name}}! Just checking in on your cleaning quote. Our team is ready to help! Reply YES to proceed or call (862) 285-4949 ✨', true),
        ('Contacted Reminder', 'Contacted', 1, 24, 'Hi {{name}}! Following up on your quote - still interested? We have availability this week! Call (862) 285-4949 📅', true)
      `);
      console.log('✓ Default SMS sequences created');
    }

    // Insert default automated workflows
    const workflowExists = await pool.query("SELECT id FROM automated_workflows LIMIT 1");
    if (workflowExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO automated_workflows (name, description, trigger_type, trigger_config, action_type, action_config, is_active) VALUES
        ('Recurring Job Generator', 'Auto-generate jobs for recurring clients when due', 'schedule', '{"cron": "0 6 * * *", "description": "Daily at 6 AM"}', 'create_recurring_jobs', '{}', true),
        ('Overdue Invoice Alert', 'Mark invoices as overdue and send reminders', 'schedule', '{"cron": "0 8 * * *", "description": "Daily at 8 AM"}', 'check_overdue_invoices', '{}', true),
        ('Lead Stale Check', 'Alert admin when leads go cold', 'schedule', '{"cron": "0 9 * * *", "description": "Daily at 9 AM"}', 'check_stale_leads', '{"threshold_hours": 72}', true)
      `);
      console.log('✓ Default automated workflows created');
    }

    console.log('✅ Database initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

export default pool;
