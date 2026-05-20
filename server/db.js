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
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS property_size VARCHAR(100)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bathrooms VARCHAR(20)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS frequency VARCHAR(50)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS county VARCHAR(100)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS city_area VARCHAR(100)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS add_ons TEXT`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_low DECIMAL(10,2)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_high DECIMAL(10,2)`);
      await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_sub_source VARCHAR(50)`);
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

    // Create service_sms_sequences table for service-specific SMS sequences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_sms_sequences (
        id SERIAL PRIMARY KEY,
        service_type VARCHAR(50) NOT NULL,
        sequence_order INTEGER NOT NULL,
        delay_hours INTEGER NOT NULL,
        message_template TEXT NOT NULL,
        trigger_status VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(service_type, trigger_status, sequence_order)
      )
    `);
    console.log('✓ Service SMS sequences table ready');

    // Create lead_sms_sequence_state table to track per-lead sequence progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_sms_sequence_state (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        service_type VARCHAR(50),
        trigger_status VARCHAR(50),
        last_sequence_step INTEGER DEFAULT 0,
        last_sent_at TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(lead_id, service_type, trigger_status)
      )
    `);
    console.log('✓ Lead SMS sequence state table ready');

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

    // Create inventory table for supplies management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        unit VARCHAR(50),
        quantity DECIMAL(10, 2) DEFAULT 0,
        min_quantity DECIMAL(10, 2) DEFAULT 0,
        cost_per_unit DECIMAL(10, 2) DEFAULT 0,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Inventory table ready');

    // Create commissions table for payroll tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        crew_id INTEGER REFERENCES crew_members(id),
        job_id INTEGER,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        pay_period VARCHAR(50),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Commissions table ready');

    // Create integrations table for external service connections
    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(100) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        settings JSONB,
        is_active BOOLEAN DEFAULT false,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Integrations table ready');

    // Create customer_portal_users table for self-service portal
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_portal_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        customer_name VARCHAR(255),
        phone VARCHAR(50),
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Customer portal users table ready');

    // Create inbound_sms table for two-way SMS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inbound_sms (
        id SERIAL PRIMARY KEY,
        from_number VARCHAR(50) NOT NULL,
        to_number VARCHAR(50),
        message TEXT NOT NULL,
        keyword VARCHAR(50),
        processed BOOLEAN DEFAULT false,
        response_sent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Inbound SMS table ready');

    // Create chatbot_conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chatbot_conversations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100),
        from_number VARCHAR(50),
        email VARCHAR(255),
        messages JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Chatbot conversations table ready');

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

    // Insert service-specific SMS sequences
    const serviceSeqExists = await pool.query("SELECT id FROM service_sms_sequences LIMIT 1");
    if (serviceSeqExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO service_sms_sequences (service_type, sequence_order, delay_hours, message_template, trigger_status, is_active) VALUES
        -- RESIDENTIAL SEQUENCES
        ('residential', 1, 0, 'Hi {{name}}! 🏠 Thanks for requesting a quote from 360 Cleaning! We will send your personalized price within 2 hours. Questions? Text back or call (862) 285-4949', 'New', true),
        ('residential', 2, 120, 'Hi {{name}}! Just checking in on your residential cleaning quote 🧹 Did you have any questions about our services or pricing? I am here to help!', 'New', true),
        ('residential', 3, 240, 'Hi {{name}}! 🌟 Our team has availability this week for residential cleaning! Ready to get your home sparkling? Call/text (862) 285-4949 to schedule', 'New', true),
        ('residential', 4, 1440, 'Hi {{name}}! ⏰ Just a reminder - we have openings later this week! Book now and mention this text for 10% off your first clean. Call (862) 285-4949', 'New', true),
        ('residential', 5, 2880, 'Hi {{name}}! 🎁 Special offer - mention CLEAN10 for 10% off your first cleaning with us! This week only. Call (862) 285-4949 to claim', 'New', true),

        -- COMMERCIAL SEQUENCES
        ('commercial', 1, 0, 'Hi {{name}}! 🏢 Thanks for your commercial cleaning inquiry. We service offices, restaurants, retail & more across NJ. Your quote ready in 2 hours!', 'New', true),
        ('commercial', 2, 120, 'Hi {{name}}! Following up on your commercial cleaning needs 💼 Our business team is ready to discuss flexible scheduling (before/after hours, weekends).', 'New', true),
        ('commercial', 3, 240, 'Hi {{name}}! 🧹 Quick question - have you had a chance to review your quote? We offer competitive pricing for businesses. Let me know if you have questions!', 'New', true),
        ('commercial', 4, 1440, 'Hi {{name}}! 💼 Final follow-up: We service 50+ NJ businesses. Questions about our commercial services? Call (862) 285-4949 - let us chat!', 'New', true),

        -- DEEP CLEANING SEQUENCES
        ('deep', 1, 0, 'Hi {{name}}! ✨ Thanks for your deep cleaning interest! We go above & beyond - scrubbed grout, clean cabinets, detailed baseboards. Price coming in 2 hours!', 'New', true),
        ('deep', 2, 120, 'Hi {{name}}! Your deep cleaning price is ready ✨ We specialize in kitchens, bathrooms, garages & hard-to-reach areas. Questions? I am here!', 'New', true),
        ('deep', 3, 240, 'Hi {{name}}! 🧽 Deep cleaning is our specialty! Have you decided? We have openings this week and offer a satisfaction guarantee. Call (862) 285-4949!', 'New', true),

        -- MOVE IN/OUT SEQUENCES
        ('move', 1, 0, 'Hi {{name}}! 🚚 Thanks for your move in/out cleaning request! We make spaces move-in ready & help protect your security deposit. Price in 2 hours!', 'New', true),
        ('move', 2, 120, 'Hi {{name}}! 🏠 Moving soon? Our move-in/out service includes deep cleaning, carpet treatment & debris removal. Your quote is ready!', 'New', true),
        ('move', 3, 240, 'Hi {{name}}! ⏰ Don\'t risk losing your security deposit! We have availability this week. Call (862) 285-4949 to schedule your move-out clean!', 'New', true),

        -- POST-CONSTRUCTION SEQUENCES
        ('construction', 1, 0, 'Hi {{name}}! 🏗️ Thanks for your post-construction cleanup request! We handle debris removal, dust & detailed finishing. Price coming in 2 hours!', 'New', true),
        ('construction', 2, 120, 'Hi {{name}}! Your post-construction price is ready 🏗️ We remove construction dust, paint splatter & debris. Call (862) 285-4949!', 'New', true),
        ('construction', 3, 240, 'Hi {{name}}! 💪 Ready for final walkthrough? We guarantee you will pass inspection. Schedule this week - we have openings! Call (862) 285-4949', 'New', true),

        -- STALE LEADS RE-ENGAGEMENT
        ('stale', 1, 0, 'Hi {{name}}! 👋 It\'s been a while since we connected. Still thinking about cleaning services? We have new availability this week!', 'Stale', true),
        ('stale', 2, 4320, 'Hi {{name}}! 🎁 Time-sensitive offer: 20% off any cleaning booked this week! Use code CLEAN20. Limited time only - claim by calling (862) 285-4949', 'Stale', true),

        -- CONVERTED/WIN-BACK SEQUENCES
        ('winback', 1, 43200, 'Hi {{name}}! 👋 It\'s been a while since your last cleaning with 360 Cleaning! Time for another refresh? We have availability this week.', 'Converted', true),
        ('winback', 2, 51840, 'Hi {{name}}! 🌟 Miss us? Your next cleaning is on us - just pay for the service and get 1 free add-on of your choice! Call to book.', 'Converted', true)
      `);
      console.log('✓ Service-specific SMS sequences created');
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
