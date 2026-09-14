import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const headers = { 'Content-Type': 'application/json' }

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { fullName, mobile, address, password } = await request.json()
  if (![fullName, mobile, address, password].every((value) => typeof value === 'string' && value.trim())) {
    return new Response(JSON.stringify({ error: 'Name, mobile number, address, and password are required.' }), { status: 400, headers })
  }
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: 'Password must be at least 8 characters.' }), { status: 400, headers })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const farmerId = `FLR-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`
  const internalEmail = `${farmerId.toLowerCase()}@farmers.farmlink.internal`
  const { data, error } = await admin.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName.trim(), mobile: mobile.trim(), address: address.trim() },
  })
  if (error || !data.user) return new Response(JSON.stringify({ error: error?.message || 'Could not create farmer.' }), { status: 400, headers })

  const { error: profileError } = await admin.from('profiles').update({
    role: 'farmer', full_name: fullName.trim(), mobile: mobile.trim(), address: address.trim(), farmer_id: farmerId,
  }).eq('id', data.user.id)
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    return new Response(JSON.stringify({ error: 'Could not create farmer profile.' }), { status: 500, headers })
  }

  return new Response(JSON.stringify({ farmerId }), { status: 201, headers })
})
