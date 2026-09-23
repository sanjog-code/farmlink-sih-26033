import { createClient } from '@supabase/supabase-js';

const url = 'https://neoyrdfpvnfsnxwjbthm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb3lyZGZwdm5mc254d2pidGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTMwMzksImV4cCI6MjEwNDk4OTAzOX0.8sphFAqAmBSIGec4YtPd7pdyf5yINW85sSd6VEh2e4A';
const supabase = createClient(url, anonKey);

async function run() {
  const tables = [
    'produce_lots',
    'farmer_listings',
    'produce_requests',
    'bulk_requests',
    'consumer_orders',
    'logistics_jobs',
    'warehouses',
    'msp_rates',
    'market_price_snapshots',
    'bulk_quotes',
    'order_items'
  ];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*');
      if (error) {
        console.log(`${t}: ERROR -> ${error.message}`);
      } else {
        console.log(`${t}: ${data.length} rows`);
        if (data.length > 0) {
          console.log(`  Sample [0]:`, JSON.stringify(data[0]).slice(0, 160));
        }
      }
    } catch (e) {
      console.log(`${t}: EXCEPTION -> ${e.message}`);
    }
  }
}

run();
