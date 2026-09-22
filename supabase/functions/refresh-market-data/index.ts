import { database, json, cors } from '../_shared/ai-guard.ts'
import { normalisePage, isOfficialMspUrl } from './normalise.js'

async function db(path: string, method = 'GET', body?: unknown) {
  const response = await database(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }), headers: { Prefer: 'resolution=merge-duplicates,return=representation' } })
  if (!response.ok) throw new Error('Market database request failed (' + response.status + ')')
  return response.status === 204 ? null : response.json()
}
async function checkOfficialSources() {
  const [rates, proposals] = await Promise.all([db('msp_rates?select=source_url'), db('msp_rate_proposals?select=source_url&status=eq.pending')])
  const urls = [...new Set<string>([...rates, ...proposals].map(row => row.source_url))].filter(isOfficialMspUrl).slice(0, 30)
  for (const url of urls) {
    const previous = await db('msp_notification_checks?source_url=eq.' + encodeURIComponent(url) + '&select=content_hash,changed_at')
    const old = previous[0]
    let record: Record<string, unknown> = { source_url: url, checked_at: new Date().toISOString(), reachable: false, note: 'Official source unavailable. Existing verified MSP remains unchanged.' }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(6000), redirect: 'error' })
      if (response.ok) {
        const bytes = await response.arrayBuffer()
        if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('Source too large')
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2, '0')).join('')
        record = { ...record, reachable: true, http_status: response.status, content_hash: hash, previous_hash: old?.content_hash || null,
          changed_at: old?.content_hash && old.content_hash !== hash ? new Date().toISOString() : old?.changed_at || null,
          note: 'Source fetched. Verify crop, season and amount against the notification before publishing a rate.' }
      } else record.http_status = response.status
    } catch { /* preserve verified MSP on upstream failures */ }
    await db('msp_notification_checks?on_conflict=source_url', 'POST', record)
  }
}
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  let run: { id: string; next_offset: number; records_received: number; records_written: number; records_rejected: number } | null = null
  try {
    const body = await request.json().catch(() => ({}))
    if (typeof body.ticket !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.ticket)) return json({ error: 'Use the authenticated admin refresh or scheduled refresh.' }, 401)
    try { run = await db('rpc/claim_market_refresh', 'POST', { p_ticket: body.ticket }) } catch { return json({ error: 'Invalid or expired scheduler ticket.' }, 403) }
    if (!run?.id) throw new Error('Could not claim the refresh job')
    if (run.next_offset === 0) await checkOfficialSources()
    const key = Deno.env.get('DATA_GOV_IN_API_KEY')
    if (!key) {
      await db('market_sync_runs?id=eq.' + run.id, 'PATCH', { status: 'failed', completed_at: new Date().toISOString(), details: 'Awaiting DATA_GOV_IN_API_KEY. Official MSP sources were checked; no mandi prices were invented.' })
      return json({ configured: false, message: 'Official sources checked. Add DATA_GOV_IN_API_KEY to activate daily mandi imports.' })
    }
    let offset = run.next_offset || 0, received = run.records_received || 0, written = run.records_written || 0, rejected = run.records_rejected || 0
    let complete = false, total: number | null = null
    for (let page = 0; page < 6; page++) {
      const url = new URL('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070')
      url.search = new URLSearchParams({ 'api-key': key, format: 'json', limit: '1000', offset: String(offset) }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error('Government market API returned ' + response.status)
      const payload = await response.json()
      if (!Array.isArray(payload.records)) throw new Error('Government market API returned an invalid dataset')
      const normalised = normalisePage(payload.records)
      if (normalised.rows.length) await db('market_price_snapshots?on_conflict=crop,market,state,district,variety,grade,price_date', 'POST', normalised.rows)
      received += payload.records.length; written += normalised.rows.length; rejected += normalised.rejected; offset += payload.records.length
      total = Number.isFinite(Number(payload.total)) ? Number(payload.total) : null
      complete = payload.records.length < 1000 || (total !== null && offset >= total)
      await db('market_sync_runs?id=eq.' + run.id, 'PATCH', { next_offset: offset, total_expected: total, records_received: received, records_written: written, records_rejected: rejected, heartbeat_at: new Date().toISOString() })
      if (complete) break
    }
    await db('market_sync_runs?id=eq.' + run.id, 'PATCH', { status: complete ? 'succeeded' : 'partial', completed_at: new Date().toISOString(), details: complete ? 'Government mandi import complete. Observation dates indicate freshness.' : 'Import checkpoint saved; scheduled continuation resumes automatically.' })
    return json({ received, written, rejected, complete })
  } catch (error) {
    if (run?.id) await db('market_sync_runs?id=eq.' + run.id, 'PATCH', { status: 'failed', completed_at: new Date().toISOString(), details: error instanceof Error ? error.message : 'Market import failed' }).catch(() => {})
    return json({ error: 'Market refresh did not complete. Existing observations remain available; inspect the admin sync log.' }, 502)
  }
})
