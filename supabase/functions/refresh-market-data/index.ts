const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders })
const resourceId = '9ef84268-d588-465a-a308-a864a43d0070'

const aliases: Record<string, string> = {
  paddy: 'Rice', 'paddy(dhan)(common)': 'Rice', rice: 'Rice', maize: 'Maize', wheat: 'Wheat',
  onion: 'Onion', tomato: 'Tomato', potato: 'Potato', soybean: 'Soybean', groundnut: 'Groundnut',
  cotton: 'Cotton', jute: 'Jute', bajra: 'Pearl millet (Bajra)', ragi: 'Finger millet (Ragi)',
  jowar: 'Sorghum (Jowar)', moong: 'Green gram (Moong)', urad: 'Black gram (Urad)',
  tur: 'Pigeon pea (Arhar/Tur)', arhar: 'Pigeon pea (Arhar/Tur)', sesame: 'Sesame', sunflower: 'Sunflower',
}

const env = () => ({ url: Deno.env.get('SUPABASE_URL')!, key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! })
const rest = async (path: string, init: RequestInit = {}) => {
  const { url, key } = env()
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) } })
}
const normalise = (value: unknown) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
const field = (row: Record<string, unknown>, ...names: string[]) => names.map((name) => row[name]).find((value) => value !== undefined && value !== null && String(value).trim() !== '')
const pricePerKg = (value: unknown) => { const n = Number(String(value || '').replace(/,/g, '')); return Number.isFinite(n) ? n / 100 : null }
const titleCase = (value: string) => value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const apiKey = Deno.env.get('DATA_GOV_IN_API_KEY')
  if (!apiKey) return json({ error: 'DATA_GOV_IN_API_KEY is missing. Add your data.gov.in API key as a Supabase secret before enabling daily refresh.' }, 503)
  // This function is deliberately callable by the database scheduler without a JWT.
  // Keep it inexpensive if somebody attempts to invoke the public endpoint repeatedly.
  const recentResponse = await rest('market_sync_runs?select=started_at&order=started_at.desc&limit=1')
  const [recent] = await recentResponse.json().catch(() => []) as Array<{ started_at: string }>
  if (recent && Date.now() - new Date(recent.started_at).getTime() < 15 * 60 * 1000) {
    return json({ skipped: true, message: 'A market refresh was started recently. Try again after 15 minutes.' }, 429)
  }
  const runStart = await rest('market_sync_runs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ source_name: 'data.gov.in / AGMARKNET', status: 'running' }) })
  const [run] = await runStart.json().catch(() => []) as Array<{ id: string }>
  if (!run?.id) return json({ error: 'Could not start the market refresh audit run.' }, 500)
  try {
    const response = await fetch(`https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=1000`, { signal: AbortSignal.timeout(20000) })
    const payload = await response.json().catch(() => ({})) as { records?: Array<Record<string, unknown>>, message?: string }
    if (!response.ok) throw new Error(payload.message || `Government market-data API returned ${response.status}`)
    const rows = payload.records || []
    const snapshots = rows.map((row) => {
      const commodity = String(field(row, 'commodity', 'Commodity') || '').trim()
      const crop = aliases[normalise(commodity)] || (commodity ? titleCase(commodity) : '')
      const modal = pricePerKg(field(row, 'modal_price', 'Modal Price'))
      const rawDate = String(field(row, 'arrival_date', 'Arrival_Date', 'date') || '')
      const date = /^\d{2}\/\d{2}\/\d{4}$/.test(rawDate) ? rawDate.split('/').reverse().join('-') : rawDate.slice(0, 10)
      if (!crop || modal === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
      return {
        crop, market: String(field(row, 'market', 'Market') || 'Unknown market'), district: String(field(row, 'district', 'District') || ''),
        state: String(field(row, 'state', 'State') || ''), variety: String(field(row, 'variety', 'Variety') || ''), price_date: date,
        min_price_per_kg: pricePerKg(field(row, 'min_price', 'Min Price')), modal_price_per_kg: modal,
        max_price_per_kg: pricePerKg(field(row, 'max_price', 'Max Price')), arrivals_tonnes: Number(field(row, 'arrival_quantity', 'Arrival Quantity') || 0) || null,
        source_record: row,
      }
    }).filter(Boolean)
    if (snapshots.length) {
      const upsert = await rest('market_price_snapshots?on_conflict=crop,market,state,price_date', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(snapshots) })
      if (!upsert.ok) throw new Error(`Could not save market data: ${await upsert.text()}`)
    }
    await rest(`market_sync_runs?id=eq.${run.id}`, { method: 'PATCH', body: JSON.stringify({ status: snapshots.length ? 'succeeded' : 'partial', completed_at: new Date().toISOString(), records_received: rows.length, records_written: snapshots.length, details: snapshots.length ? 'Daily government mandi records imported.' : 'No supported FarmLink crop records were returned.' }) })
    return json({ source: 'data.gov.in / AGMARKNET', received: rows.length, written: snapshots.length, msp: 'MSP remains tied to the verified seasonal Government notification; this daily job imports mandi prices only.' })
  } catch (error) {
    if (run?.id) await rest(`market_sync_runs?id=eq.${run.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'failed', completed_at: new Date().toISOString(), details: error instanceof Error ? error.message : 'Unknown refresh error' }) })
    return json({ error: error instanceof Error ? error.message : 'Market refresh failed.' }, 502)
  }
})
