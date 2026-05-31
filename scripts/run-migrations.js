const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });

  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials missing from .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const sql = `
    CREATE TABLE IF NOT EXISTS marketing_partnered_companies (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      website TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE marketing_partnered_companies ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Full access" ON marketing_partnered_companies;
    CREATE POLICY "Full access" ON marketing_partnered_companies FOR ALL USING (true) WITH CHECK (true);

    CREATE TABLE IF NOT EXISTS bulk_outreach_campaigns (
      id BIGSERIAL PRIMARY KEY,
      channel TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      total_recipients INT DEFAULT 0,
      sent_count INT DEFAULT 0,
      failed_count INT DEFAULT 0,
      status TEXT DEFAULT 'pending',
      errors TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE bulk_outreach_campaigns ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Full access" ON bulk_outreach_campaigns;
    CREATE POLICY "Full access" ON bulk_outreach_campaigns FOR ALL USING (true) WITH CHECK (true);
  `;

  async function migrate() {
    console.log('Running Supabase DB migrations via execute_sql RPC...');
    const { data, error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    console.log('Migration successful!', data);
    process.exit(0);
  }

  migrate();
} catch (e) {
  console.error('Error executing migration script:', e);
  process.exit(1);
}
