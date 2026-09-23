import { createClient } from '@supabase/supabase-js';

const url = 'https://neoyrdfpvnfsnxwjbthm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb3lyZGZwdm5mc254d2pidGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTMwMzksImV4cCI6MjEwNDk4OTAzOX0.8sphFAqAmBSIGec4YtPd7pdyf5yINW85sSd6VEh2e4A';
const supabase = createClient(url, anonKey);

async function purgeSampleData() {
  console.log("Purging sample records from DB...");
  const { data, error } = await supabase.from('farmer_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error("Error deleting from farmer_listings:", error.message);
  } else {
    console.log("Successfully purged farmer_listings sample data!");
  }

  // Also check produce_lots, produce_requests, etc.
  await supabase.from('produce_lots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('produce_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bulk_quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bulk_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('consumer_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('logistics_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("All sample data purged from DB.");
}

purgeSampleData();
