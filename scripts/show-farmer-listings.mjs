import { createClient } from '@supabase/supabase-js';

const url = 'https://neoyrdfpvnfsnxwjbthm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb3lyZGZwdm5mc254d2pidGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTMwMzksImV4cCI6MjEwNDk4OTAzOX0.8sphFAqAmBSIGec4YtPd7pdyf5yINW85sSd6VEh2e4A';
const supabase = createClient(url, anonKey);

async function run() {
  const { data, error } = await supabase.from('farmer_listings').select('id, crop, quantity_kg, price_per_kg, status, created_at');
  if (error) {
    console.error(error);
  } else {
    console.log("Count:", data.length);
    console.log(data);
  }
}

run();
