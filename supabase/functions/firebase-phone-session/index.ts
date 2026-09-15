import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  try {
    const { idToken } = await request.json()
    const projectId = Deno.env.get('FIREBASE_PROJECT_ID')
    if (!projectId) throw new Error('Firebase Phone Authentication is not configured on the server yet.')
    const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))
    const { payload } = await jwtVerify(String(idToken || ''), jwks, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    const phone = typeof payload.phone_number === 'string' ? payload.phone_number : ''
    if (!phone) throw new Error('Firebase did not verify a phone number for this session.')
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: profile } = await admin.from('profiles').select('id').eq('mobile', phone).eq('role', 'farmer').maybeSingle()
    if (!profile) throw new Error('No registered farmer account matches this verified mobile number.')
    const { data: userResult, error: userError } = await admin.auth.admin.getUserById(profile.id)
    if (userError || !userResult.user) throw new Error('Farmer account could not be loaded.')
    const email = userResult.user.email || `${profile.id}@farmer.farmlink.local`
    if (!userResult.user.email) {
      const { error } = await admin.auth.admin.updateUserById(profile.id, { email, email_confirm: true })
      if (error) throw error
    }
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
    if (linkError || !link?.properties?.hashed_token) throw linkError || new Error('Could not open a FarmLink session.')
    return new Response(JSON.stringify({ tokenHash: link.properties.hashed_token }), { headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Phone verification failed.' }), { status: 400, headers: corsHeaders })
  }
})
