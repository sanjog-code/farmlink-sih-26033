const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const form = await request.formData()
    const audio = form.get('audio')
    const provider = String(form.get('provider') || 'bhashini')
    const language = String(form.get('language') || 'hi')
    if (!(audio instanceof File)) return json({ error: 'Audio recording is required.' }, 400)
    if (audio.size === 0 || audio.size > 10 * 1024 * 1024) return json({ error: 'Audio must be between 1 byte and 10 MB.' }, 400)
    if (!['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'].includes(audio.type)) return json({ error: 'Unsupported audio format.' }, 400)

    if (provider === 'bhashini') {
      const apiKey = Deno.env.get('BHASHINI_API_KEY')
      const serviceId = language === 'hi' ? Deno.env.get('BHASHINI_ASR_SERVICE_ID_HI') : Deno.env.get('BHASHINI_ASR_SERVICE_ID_EN')
      if (!apiKey || !serviceId) return json({ error: 'BHASHINI is not configured yet. Add the API key and ASR service ID as Supabase secrets.' }, 503)
      const bytes = new Uint8Array(await audio.arrayBuffer())
      let binary = ''
      for (const byte of bytes) binary += String.fromCharCode(byte)
      const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ pipelineTasks: [{ taskType: 'asr', config: { serviceId, language: { sourceLanguage: language } } }], inputData: { audio: [{ audioContent: btoa(binary) }] } }),
      })
      const payload = await response.json()
      if (!response.ok) return json({ error: payload?.error?.message || payload?.message || 'BHASHINI transcription failed.' }, response.status)
      const text = payload?.pipelineResponse?.[0]?.output?.[0]?.source
      if (!text) return json({ error: 'BHASHINI returned no transcript.' }, 502)
      return json({ text, provider: 'bhashini', language })
    }

    if (provider === 'whisper') {
      const apiKey = Deno.env.get('OPENAI_API_KEY')
      if (!apiKey) return json({ error: 'Whisper is not configured yet. Add OPENAI_API_KEY as a Supabase secret.' }, 503)
      const upstream = new FormData()
      upstream.append('file', audio, audio.name || 'farmlink-recording.webm')
      upstream.append('model', 'whisper-1')
      upstream.append('language', language)
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: upstream })
      const payload = await response.json()
      if (!response.ok) return json({ error: payload?.error?.message || 'Whisper transcription failed.' }, response.status)
      return json({ text: payload.text, provider: 'whisper', language })
    }

    return json({ error: 'Unknown transcription provider.' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Transcription could not be completed.' }, 500)
  }
})
