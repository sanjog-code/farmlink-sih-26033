import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

const normalisePhone = (value: unknown) => {
  const raw = String(value ?? '').trim()
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (raw.startsWith('+') && digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })

  const { fullName, mobile, address } = await request.json()
  const phone = normalisePhone(mobile)
  if (![fullName, address].every((value) => typeof value === 'string' && value.trim()) || !phone) {
    return new Response(JSON.stringify({ error: 'Name, address, and a valid mobile number are required.' }), { status: 400, headers: corsHeaders })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: existingProfiles } = await admin.from('profiles').select('farmer_id').eq('mobile', phone).limit(1)
  if (existingProfiles?.[0]?.farmer_id) {
    return new Response(JSON.stringify({ farmerId: existingProfiles[0].farmer_id, existing: true }), { status: 200, headers: corsHeaders })
  }

  const farmerId = `FLR-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`
  const { data, error } = await admin.auth.admin.createUser({
    email: `${farmerId.toLowerCase()}@farmer.farmlink.local`,
    email_confirm: true,
    phone,
    phone_confirm: false,
    user_metadata: { full_name: fullName.trim(), mobile: phone, address: address.trim() },
  })
  if (error || !data.user) return new Response(JSON.stringify({ error: error?.message || 'Could not create farmer.' }), { status: 400, headers: corsHeaders })

  const { error: profileError } = await admin.from('profiles').update({
    role: 'farmer', full_name: fullName.trim(), mobile: phone, address: address.trim(), farmer_id: farmerId,
  }).eq('id', data.user.id)
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    return new Response(JSON.stringify({ error: 'Could not create farmer profile.' }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ farmerId, phone }), { status: 201, headers: corsHeaders })
})
