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

const twilioRequest = async (path: string, params: Record<string, string>) => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const serviceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID')
  if (!accountSid || !authToken || !serviceSid) throw new Error('Twilio Verify is not configured. Add the three Twilio secrets in Supabase first.')
  const credentials = btoa(`${accountSid}:${authToken}`)
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/${path}`, {
    method: 'POST', headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.message || 'Twilio Verify could not complete the request.')
  return body
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  try {
    const { action, mobile, code } = await request.json()
    const phone = normalisePhone(mobile)
    if (!phone) throw new Error('Enter a valid Indian mobile number.')
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: profile } = await admin.from('profiles').select('id,farmer_id').eq('mobile', phone).eq('role', 'farmer').maybeSingle()
    if (!profile) throw new Error('No farmer account is registered for this mobile number.')

    if (action === 'send') {
      await twilioRequest('Verifications', { To: phone, Channel: 'sms' })
      return new Response(JSON.stringify({ sent: true }), { headers: corsHeaders })
    }
    if (action !== 'check' || !/^\d{4,10}$/.test(String(code ?? ''))) throw new Error('Enter the OTP sent to your mobile number.')
    const verification = await twilioRequest('VerificationCheck', { To: phone, Code: String(code) })
    if (verification.status !== 'approved') throw new Error('The OTP is invalid or has expired.')

    const { data: userResult, error: userError } = await admin.auth.admin.getUserById(profile.id)
    if (userError || !userResult.user) throw new Error('Farmer account could not be loaded.')
    const authEmail = userResult.user.email || `${profile.id}@farmer.farmlink.local`
    if (!userResult.user.email) {
      const { error: updateError } = await admin.auth.admin.updateUserById(profile.id, { email: authEmail, email_confirm: true })
      if (updateError) throw updateError
    }
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email: authEmail })
    if (linkError || !link?.properties?.hashed_token) throw linkError || new Error('Could not create the verified farmer session.')
    return new Response(JSON.stringify({ tokenHash: link.properties.hashed_token }), { headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'OTP verification failed.' }), { status: 400, headers: corsHeaders })
  }
})
