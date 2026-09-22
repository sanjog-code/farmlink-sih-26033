export class SafeError extends Error {
  constructor(message: string, public status = 400, public code = 'REQUEST_FAILED') { super(message) }
}
export const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors })
export const replyError = (error: unknown) => error instanceof SafeError ? json({ error: error.message, code: error.code }, error.status) : json({ error: 'The service could not complete this request. Please try again or continue manually.', code: 'SERVICE_UNAVAILABLE' }, 503)
export async function fetchTimed(url: string, init: RequestInit = {}, timeout = 25_000) {
  try { return await fetch(url, { ...init, signal: AbortSignal.timeout(timeout), redirect: 'error' }) }
  catch { throw new SafeError('The service is temporarily unavailable. Please try again or continue manually.', 503, 'PROVIDER_UNAVAILABLE') }
}
export async function database(path: string, init: RequestInit = {}) {
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new SafeError('The secure service is not configured.', 503, 'NOT_CONFIGURED')
  return await fetchTimed(`${url}/rest/v1/${path}`, { ...init, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) } }, 10_000)
}
export async function authenticate(request: Request, roles?: string[]) {
  const authorization = request.headers.get('authorization') || ''
  if (!/^Bearer\s+\S+$/i.test(authorization)) throw new SafeError('Please log in to use this service.', 401, 'LOGIN_REQUIRED')
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_ANON_KEY')
  if (!url || !key) throw new SafeError('The secure service is not configured.', 503, 'NOT_CONFIGURED')
  const response = await fetchTimed(`${url}/auth/v1/user`, { headers: { Authorization: authorization, apikey: key } }, 10_000)
  if (!response.ok) throw new SafeError('Your session has expired. Please log in again.', 401, 'LOGIN_REQUIRED')
  const user = await response.json()
  if (!user?.id || user.is_anonymous) throw new SafeError('Please log in with a registered account.', 401, 'LOGIN_REQUIRED')
  let role: string | undefined
  if (roles) {
    const profile = await database(`profiles?id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`)
    if (!profile.ok) throw new SafeError('Account access could not be verified. Please retry.', 503)
    role = (await profile.json())?.[0]?.role
    if (!role || !roles.includes(role)) throw new SafeError('Your account does not have access to this feature.', 403, 'FORBIDDEN')
  }
  return { id: user.id as string, role }
}
export async function consumeQuota(userId: string, service: 'voice' | 'grading') {
  const response = await database('rpc/consume_ai_quota', { method: 'POST', body: JSON.stringify({ p_user_id: userId, p_service: service }) })
  if (!response.ok) throw new SafeError('The service is not ready yet. Please continue manually.', 503, 'NOT_CONFIGURED')
  if ((await response.json()) !== true) throw new SafeError('You have reached the hourly limit. Please try later or continue manually.', 429, 'RATE_LIMITED')
}
export async function limitedForm(request: Request, maxBytes: number) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new SafeError('The uploaded file is too large.', 413)
  if (!request.body) throw new SafeError('A file is required.')
  const reader = request.body.getReader(), chunks: Uint8Array[] = []
  let bytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.byteLength
    if (bytes > maxBytes) { await reader.cancel(); throw new SafeError('The uploaded file is too large.', 413) }
    chunks.push(value)
  }
  const body = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
  try { return await new Response(body, { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData() }
  catch { throw new SafeError('Please submit a valid file upload.') }
}
export function toBase64(bytes: Uint8Array) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  return btoa(binary)
}
