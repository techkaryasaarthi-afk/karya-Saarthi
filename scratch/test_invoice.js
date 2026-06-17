const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: project } = await supabase.from('service_requests').select('*').limit(1).single();
  if (!project) return console.log("No projects found");

  const { data: users } = await supabase.from('users').select('*').limit(1);

  console.log("Testing insert...");
  const { data, error } = await supabase.from('invoices').insert({
    client_id: project.user_id,
    project_id: project.id,
    issued_by: users[0].id,
    invoice_number: 'TEST-123',
    subtotal: project.budget || 100,
    tax_percent: 0,
    tax_amount: 0,
    discount: 0,
    total: project.budget || 100,
    status: 'pending',
    notes: 'Test note'
  }).select().single();

  if (error) {
    console.log("INVOICE ERROR:", error);
  } else {
    console.log("INVOICE SUCCESS:", data);
    
    const { data: itemData, error: itemError } = await supabase.from('invoice_items').insert({
      invoice_id: data.id,
      description: 'Test Service',
      quantity: 1,
      unit_price: project.budget || 100,
      total: project.budget || 100
    }).select().single();
    
    if (itemError) console.log("ITEM ERROR:", itemError);
    else console.log("ITEM SUCCESS:", itemData);
  }
}

test();
