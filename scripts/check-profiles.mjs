import { createClient } from '@supabase/supabase-js';

const url = 'https://neoyrdfpvnfsnxwjbthm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb3lyZGZwdm5mc254d2pidGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTMwMzksImV4cCI6MjEwNDk4OTAzOX0.8sphFAqAmBSIGec4YtPd7pdyf5yINW85sSd6VEh2e4A';
const supabase = createClient(url, anonKey);

async function run() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles?.length, pErr?.message || '');
  if (profiles?.length) console.log(profiles);

  const { data: warehouses, error: wErr } = await supabase.from('warehouses').select('*');
  console.log("Warehouses:", warehouses?.length, wErr?.message || '');
  if (warehouses?.length) console.log(warehouses);
}

run();
