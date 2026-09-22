import { authenticate, consumeQuota, cors, database, fetchTimed, json, limitedForm, replyError, SafeError, toBase64 } from '../_shared/ai-guard.ts'
import { validateGradeReport } from './validation.ts'

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const user = await authenticate(request, ['admin', 'farmer'])
    const endpoint = Deno.env.get('GRADING_API_URL'), key = Deno.env.get('GRADING_API_KEY')
    if (!endpoint || !key) return json({ available: false, code: 'NOT_CONFIGURED', message: 'AI photo review is awaiting activation. Continue with the operator’s manual grade.' })
    let url: URL
    try { url = new URL(endpoint) } catch { throw new SafeError('The grading service needs configuration.', 503, 'NOT_CONFIGURED') }
    if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new SafeError('The grading service needs a secure endpoint.', 503, 'NOT_CONFIGURED')
    const form = await limitedForm(request, 9 * 1024 * 1024)
    const image = form.get('image'), crop = String(form.get('crop') || '').trim(), listingId = String(form.get('listing_id') || '').trim()
    if (!(image instanceof File) || !image.size || image.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) throw new SafeError('Choose a JPEG, PNG or WebP produce photo below 8 MB.')
    if (!crop || crop.length > 120) throw new SafeError('Choose the crop before reviewing its photo.')
    if (listingId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId)) throw new SafeError('The listing reference is invalid.')
      const result = await database(`farmer_listings?id=eq.${listingId}&select=farmer_id,crop&limit=1`)
      if (!result.ok) throw new SafeError('The listing could not be checked.', 503)
      const listing = (await result.json())?.[0]
      if (!listing || (user.role !== 'admin' && listing.farmer_id !== user.id)) throw new SafeError('You do not have access to this listing.', 403)
      if (listing.crop !== crop) throw new SafeError('Choose the crop recorded for this listing.')
    }
    const bytes = new Uint8Array(await image.arrayBuffer())
    const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    const isPng = bytes[0] === 137 && String.fromCharCode(...bytes.subarray(1, 4)) === 'PNG'
    const isWebp = String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'
    if (!(image.type === 'image/jpeg' && isJpeg || image.type === 'image/png' && isPng || image.type === 'image/webp' && isWebp)) throw new SafeError('The photo format does not match the uploaded file.')
    await consumeQuota(user.id, 'grading')
    const upstream = await fetchTimed(url.toString(), { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ schema_version: 'farmlink.grading.v1', crop, image: { mime_type: image.type, base64: toBase64(bytes) }, task: 'suggest_visual_grade', human_review_required: true }) }, 30_000)
    if (!upstream.ok) throw new SafeError('AI photo review is unavailable. Continue with manual inspection.', 503, 'PROVIDER_UNAVAILABLE')
    let report
    try { report = validateGradeReport(await upstream.json()) } catch { throw new SafeError('The photo review was inconclusive. Use manual inspection for this intake.', 502, 'INVALID_MODEL_REPORT') }
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    const photoHash = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('')
    const saved = await database('ai_grading_reports', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...report, created_by: user.id, crop, listing_id: listingId || null, photo_sha256: photoHash }) })
    if (!saved.ok) throw new SafeError('The review could not be saved. Please use manual inspection or retry.', 503)
    return json({ available: true, report: (await saved.json())?.[0] })
  } catch (error) { return replyError(error) }
})
