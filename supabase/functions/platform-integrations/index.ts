import { configuredServices, safePartnerUrl } from './helpers.ts';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const env = (name: string) => Deno.env.get(name);
const projectUrl = env('SUPABASE_URL')!;
const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')!;

async function rest(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${projectUrl}/rest/v1/${path}`, {
    method, headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Integration database operation failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

async function isAdmin(request: Request) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return false;
  const response = await fetch(`${projectUrl}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: authorization }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) return false;
  const user = await response.json();
  if (!user.id) return false;
  const profiles = await rest(`profiles?select=role&id=eq.${encodeURIComponent(user.id)}&limit=1`);
  return profiles[0]?.role === 'admin';
}

async function processQueue(channel: 'email' | 'ondc') {
  const readiness = configuredServices(env);
  if (!(channel === 'email' ? readiness.email.configured : readiness.ondcPartner.configured)) return { skipped: 'Awaiting configuration', processed: 0 };
  const endpoint = channel === 'email' ? 'https://api.resend.com/emails' : safePartnerUrl(env('ONDC_PARTNER_URL')!);
  const claimed = await rest('rpc/claim_integration_outbox', 'POST', { p_channel: channel, p_limit: 10 });
  let sent = 0;
  let failed = 0;
  for (const item of claimed) {
    try {
      const body = channel === 'email' ? {
        from: env('NOTIFICATION_FROM_EMAIL'), to: [item.payload.to], subject: item.payload.subject, text: item.payload.text,
      } : { event_id: item.id, ...item.payload };
      const response = await fetch(endpoint, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env(channel === 'email' ? 'RESEND_API_KEY' : 'ONDC_PARTNER_API_KEY')}`,
          'Idempotency-Key': `farmlink-${item.id}` }, body: JSON.stringify(body),
      });
      // Do not persist provider error bodies: they may contain credentials or personal data.
      if (!response.ok) throw new Error(`Provider request failed (${response.status})`);
      const result = await response.json().catch(() => ({}));
      if (channel === 'email' && typeof result.id !== 'string') throw new Error('Email provider did not return a delivery reference');
      if (channel === 'ondc' && (!result.reference || result.accepted !== true)) throw new Error('Partner must acknowledge accepted=true with a reference');
      await rest(`integration_outbox?id=eq.${item.id}&status=eq.processing`, 'PATCH', {
        status: 'sent', provider_reference: String(result.id || result.reference).slice(0, 200), sent_at: new Date().toISOString(), last_error: null,
      });
      sent++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Provider unavailable';
      await rest(`integration_outbox?id=eq.${item.id}&status=eq.processing`, 'PATCH', {
        status: 'failed', last_error: message.slice(0, 200),
        next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** item.attempts) * 60000).toISOString(),
      });
      failed++;
    }
  }
  return { processed: claimed.length, sent, failed };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await request.json().catch(() => ({}));
    const schedulerToken = request.headers.get('x-platform-scheduler');
    const scheduler = schedulerToken && body.action === 'process'
      ? await rest('rpc/validate_platform_scheduler_token', 'POST', { p_token: schedulerToken }) : false;
    if (!scheduler && !await isAdmin(request)) return json({ error: 'Administrator access required' }, 403);
    if (body.action === 'status') return json({ services: configuredServices(env) });
    if (body.action !== 'process') return json({ error: 'Unknown integration action' }, 400);
    return json({ email: await processQueue('email'), ondc: await processQueue('ondc') });
  } catch {
    return json({ error: 'Integration request failed. Check function logs and configuration.' }, 500);
  }
});
